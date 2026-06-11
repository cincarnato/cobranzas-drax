import InboundEmailServiceFactory from "../../mail/factory/services/InboundEmailServiceFactory.js";
import type {
    IInboundEmail,
    IInboundEmailProcessMark,
    InboundEmailProcessMarkStatus
} from "../../mail/interfaces/IInboundEmail.js";
import InboundEmailService from "../../mail/services/InboundEmailService.js";
import type {IAIProvider} from "@drax/ai-back";
import {AiProviderFactory} from "@drax/ai-back";
import {SettingServiceFactory} from "@drax/settings-back";
import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
import PayerServiceFactory from "../factory/services/PayerServiceFactory.js";
import type {ITransferEmail, ITransferEmailBase, TransferEmailAffiliateStrategy} from "../interfaces/ITransferEmail.js";
import type {IPayer, IPayerLookupCriteria, PayerStrategy} from "../interfaces/IPayer.js";
import TransferEmailService from "../services/TransferEmailService.js";
import PayerService from "../services/PayerService.js";
import {z} from "zod";

type ProcessTransfersResult = {
    since: Date | null;
    limit: number;
    scanned: number;
    created: number;
    skipped: number;
    failed: number;
};

type ProcessTransfersOptions = {
    since?: Date | string | null;
    limit?: number | string | null;
};

type ReprocessTransferEmailChange = {
    field: string;
    label: string;
    before: string;
    after: string;
};

type ReprocessTransferEmailResult = {
    transferEmail: ITransferEmail;
    previousTransferEmail: ITransferEmail;
    updatedFields: ITransferEmailBase;
    changes: ReprocessTransferEmailChange[];
    changed: boolean;
    payerFound: boolean;
    payerStrategy?: PayerStrategy;
    previousAffiliateStrategy?: TransferEmailAffiliateStrategy;
    currentAffiliateStrategy?: TransferEmailAffiliateStrategy;
};

const DEFAULT_PROCESS_LIMIT = 10;
const DEFAULT_PROCESS_INTERVAL_MS = 60_000;
const DEFAULT_AI_TOOL_MAX_ITERATIONS = 10;
const INBOUND_MAIL_TRANSFER_AUTO_PROCESS_SETTING_KEY = "InboundMailTransferAutoProcess";
const INBOUND_MAIL_TRANSFER_CATEGORY_SETTING_KEY = "InboundMailTransferCategory";
const TRANSFER_EMAIL_PROCESS_MARK_KEY = "transfer-email";
const TRANSFER_EMAIL_MAX_PROCESS_ATTEMPTS = 2;
const EMAIL_DATA_AFFILIATE_STRATEGY: TransferEmailAffiliateStrategy = "EMAIL_DATA";

const transferEmailAiAdditionalAffiliateSchema = z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
    documentNumber: z.string().nullable(),
});

const transferEmailAiItemSchema = z.object({
    amount: z.number().nullable(),
    currency: z.enum(["ARS", "USD", "EUR", "OTHER"]).nullable(),
    transferDate: z.string().nullable(),
    operationNumber: z.string().nullable(),
    concept: z.string().nullable(),
    originAccount: z.string().nullable(),
    originCbu: z.string().nullable(),
    originAlias: z.string().nullable(),
    originBank: z.string().nullable(),
    destinationAccount: z.string().nullable(),
    destinationCbu: z.string().nullable(),
    destinationAlias: z.string().nullable(),
    destinationBank: z.string().nullable(),
    affiliateName: z.string().nullable(),
    affiliateEmail: z.string().nullable(),
    affiliateDocumentNumber: z.string().nullable(),
    emailDocumentNumber: z.string().nullable().optional(),
    additionalAffiliates: z.array(transferEmailAiAdditionalAffiliateSchema).nullable().optional().default([]),
    needsHumanReview: z.boolean().nullable(),
    reasoning: z.string().nullable(),
});

const transferEmailAiSchema = z.object({
    isTransferProof: z.boolean(),
    transfers: z.array(transferEmailAiItemSchema),
    needsHumanReview: z.boolean().nullable(),
    reasoning: z.string().nullable(),
});

type TransferEmailAiResult = z.infer<typeof transferEmailAiSchema>;

const DEFAULT_AI_PROVIDER = "OllamaAi";

function resolveAiProviderName(): string {
    return process.env.AI_PROVIDER || DEFAULT_AI_PROVIDER;
}

class InboundMailTransferProcessor {
    private static singleton: InboundMailTransferProcessor;
    private inboundMailService: InboundEmailService;
    private transferEmailService: TransferEmailService;
    private payerService: PayerService;
    private aiProvider: IAIProvider;
    private processTimer?: NodeJS.Timeout;
    private processInProgress = false;
    private readonly processIntervalMs: number;
    private readonly aiToolMaxIterations: number;

    constructor(
        inboundMailService: InboundEmailService = InboundEmailServiceFactory.instance,
        transferEmailService: TransferEmailService = TransferEmailServiceFactory.instance,
        openAiProvider: IAIProvider = AiProviderFactory.instance(resolveAiProviderName()),
        payerService: PayerService = PayerServiceFactory.instance
    ) {
        this.inboundMailService = inboundMailService;
        this.transferEmailService = transferEmailService;
        this.aiProvider = openAiProvider;
        this.payerService = payerService;
        this.processIntervalMs = this.readNumberEnv("INBOUND_MAIL_TRANSFER_PROCESS_INTERVAL_MS", DEFAULT_PROCESS_INTERVAL_MS);
        this.aiToolMaxIterations = this.readNumberEnv("INBOUND_MAIL_TRANSFER_AI_TOOL_MAX_ITERATIONS", DEFAULT_AI_TOOL_MAX_ITERATIONS);
    }

    static get instance(): InboundMailTransferProcessor {
        if (!InboundMailTransferProcessor.singleton) {
            InboundMailTransferProcessor.singleton = new InboundMailTransferProcessor();
        }

        return InboundMailTransferProcessor.singleton;
    }

    start(): void {
        this.startTransferAutoProcessInterval();
    }

    stop(): void {
        this.stopTransferAutoProcessInterval();
    }

    startTransferAutoProcessInterval(intervalMs = this.processIntervalMs): void {
        if (this.processTimer) {
            return;
        }

        void this.runTransferAutoProcess();
        this.processTimer = setInterval(() => {
            void this.runTransferAutoProcess();
        }, intervalMs);
    }

    stopTransferAutoProcessInterval(): void {
        if (this.processTimer) {
            clearInterval(this.processTimer);
            this.processTimer = undefined;
        }
    }

    async process(options: ProcessTransfersOptions = {}): Promise<ProcessTransfersResult> {
        const limit = this.resolveLimitOption(options.limit);
        const requestedSince = this.resolveSinceOption(options.since);

        if (this.processInProgress) {
            return {
                since: requestedSince,
                limit,
                scanned: 0,
                created: 0,
                skipped: 0,
                failed: 0,
            };
        }

        this.processInProgress = true;

        try {
            const since = requestedSince;
            const inboundEmails = await this.findInboundEmailsToProcess(since, limit);

            return {
                since,
                limit,
                ...await this.processInboundEmailBatch(inboundEmails),
            };
        } finally {
            this.processInProgress = false;
        }
    }

    async processInboundEmails(options: ProcessTransfersOptions = {}): Promise<ProcessTransfersResult> {
        return this.process(options);
    }

    async reprocessTransferEmail(transferEmailId: string): Promise<ReprocessTransferEmailResult> {
        const transferEmail = await this.transferEmailService.findById(transferEmailId);
        if (!transferEmail) {
            throw new Error("Transfer email not found");
        }

        const affiliateResolution = await this.resolveAffiliateFromPayerMappings({
            emailFromName: this.normalizeString(transferEmail.emailFromName),
            emailFromEmail: this.normalizeString(transferEmail.emailFromEmail),
            emailDocumentNumber: this.normalizeDocumentNumber(transferEmail.emailDocumentNumber),
            originCbu: this.normalizeString(transferEmail.originCbu),
            originAccount: this.normalizeString(transferEmail.originAccount),
            additionalAffiliates: this.normalizeAdditionalAffiliates(transferEmail.additionalAffiliates),
        });

        const updatePayload: ITransferEmailBase = this.removeUndefinedFields({
            affiliateName: affiliateResolution.affiliateName,
            affiliateEmail: affiliateResolution.affiliateEmail,
            affiliateDocumentNumber: affiliateResolution.affiliateDocumentNumber,
            affiliateStrategy: affiliateResolution.affiliateStrategy,
            additionalAffiliates: affiliateResolution.additionalAffiliates,
            needsHumanReview: this.resolveReprocessedNeedsHumanReview(transferEmail, affiliateResolution.affiliateDocumentNumber),
            processDate: new Date(),
        });

        const changed = this.hasAffiliateResolutionChanged(transferEmail, updatePayload);
        const changes = this.buildReprocessChanges(transferEmail, updatePayload);
        await this.transferEmailService.updatePartial(transferEmailId, updatePayload);
        const updatedTransferEmail = await this.transferEmailService.findById(transferEmailId);

        return {
            transferEmail: updatedTransferEmail,
            previousTransferEmail: transferEmail,
            updatedFields: updatePayload,
            changes,
            changed,
            payerFound: affiliateResolution.payerFound,
            payerStrategy: affiliateResolution.payerStrategy,
            previousAffiliateStrategy: transferEmail.affiliateStrategy,
            currentAffiliateStrategy: updatedTransferEmail.affiliateStrategy,
        };
    }

    private async processInboundEmailBatch(inboundEmails: IInboundEmail[]): Promise<Pick<ProcessTransfersResult, "scanned" | "created" | "skipped" | "failed">> {
        if (inboundEmails.length === 0) {
            return {
                scanned: 0,
                created: 0,
                skipped: 0,
                failed: 0,
            };
        }

        let created = 0;
        let skipped = 0;
        let failed = 0;

        for (const inboundEmail of inboundEmails) {
            const attempts = this.resolveNextTransferEmailAttempt(inboundEmail);

            try {
                const existingTransferEmails = await this.findExistingTransferEmails(inboundEmail);
                if (existingTransferEmails.length > 0) {
                    await this.markInboundEmailProcess(inboundEmail, "SUCCESS", {
                        attempts: this.resolveCurrentTransferEmailAttempts(inboundEmail),
                        metadata: {
                            reason: "existing-transfer-email",
                            transferEmailIds: existingTransferEmails.map((transferEmail) => transferEmail._id),
                        },
                    });
                    skipped++;
                    continue;
                }

                await this.markInboundEmailProcess(inboundEmail, "PROCESSING", {attempts});

                const transferEmails = await this.buildTransferEmailPayloads(inboundEmail);
                if (transferEmails.length === 0) {
                    await this.markInboundEmailProcess(inboundEmail, "SKIPPED", {
                        attempts,
                        metadata: {reason: "not-transfer-proof"},
                    });
                    skipped++;
                    continue;
                }

                const createdTransferEmailIds: string[] = [];
                for (const transferEmail of transferEmails) {
                    const createdTransferEmail = await this.transferEmailService.create(transferEmail);
                    createdTransferEmailIds.push(createdTransferEmail._id);
                    created++;
                }

                await this.markInboundEmailProcess(inboundEmail, "SUCCESS", {
                    attempts,
                    metadata: {transferEmailIds: createdTransferEmailIds},
                });
            } catch (error) {
                await this.markInboundEmailProcess(inboundEmail, "FAILED", {
                    attempts,
                    lastError: this.serializeErrorMessage(error),
                });
                failed++;
                this.logError("Error processing inbound transfer email", error, {
                    inboundEmailId: inboundEmail._id,
                    messageId: inboundEmail.messageId,
                    attempts,
                });
            }
        }

        return {
            scanned: inboundEmails.length,
            created,
            skipped,
            failed,
        };
    }

    private async runTransferAutoProcess(): Promise<void> {
        if (!await this.isSettingEnabled(INBOUND_MAIL_TRANSFER_AUTO_PROCESS_SETTING_KEY)) {
            return;
        }

        try {
            await this.process();
        } catch (error) {
            this.logError("Error processing inbound transfer emails", error);
        }
    }

    private resolveSinceOption(since?: Date | string | null): Date | null {
        if (!since) {
            return null;
        }

        if (since instanceof Date) {
            if (Number.isNaN(since.getTime())) {
                throw new Error("Invalid since date");
            }

            return since;
        }

        const parsedSince = new Date(since);
        if (Number.isNaN(parsedSince.getTime())) {
            throw new Error("Invalid since date");
        }

        return parsedSince;
    }

    private resolveLimitOption(limit?: number | string | null): number {
        if (limit === undefined || limit === null || limit === "") {
            return DEFAULT_PROCESS_LIMIT;
        }

        const parsedLimit = typeof limit === "number"
            ? limit
            : Number(limit);

        if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
            throw new Error("Invalid limit");
        }

        return parsedLimit;
    }

    private async findInboundEmailsToProcess(since: Date | null, limit: number): Promise<IInboundEmail[]> {
        const category = await this.getTransferEmailCategoryFilter();

        return await this.inboundMailService.findByProcessMarkStatus({
            processMarkKey: TRANSFER_EMAIL_PROCESS_MARK_KEY,
            processingStatus: "PROCESSED",
            category,
            retryStatus: "FAILED",
            maxAttempts: TRANSFER_EMAIL_MAX_PROCESS_ATTEMPTS,
            since,
            limit,
            orderBy: "receivedAt",
            order: "asc",
        });
    }

    private findTransferEmailProcessMark(inboundEmail: IInboundEmail): IInboundEmailProcessMark | undefined {
        return inboundEmail.processMarks?.find((mark) => mark.key === TRANSFER_EMAIL_PROCESS_MARK_KEY);
    }

    private resolveCurrentTransferEmailAttempts(inboundEmail: IInboundEmail): number {
        return this.findTransferEmailProcessMark(inboundEmail)?.attempts || 0;
    }

    private resolveNextTransferEmailAttempt(inboundEmail: IInboundEmail): number {
        return this.resolveCurrentTransferEmailAttempts(inboundEmail) + 1;
    }

    private async findExistingTransferEmails(inboundEmail: IInboundEmail): Promise<ITransferEmail[]> {
        const byMessageId = await this.transferEmailService.find({
            filters: [{field: "emailMessageId", operator: "eq", value: inboundEmail.messageId}],
            limit: 20,
        });

        const byInboundEmail = await this.transferEmailService.find({
            filters: [{field: "inboundEmail", operator: "eq", value: inboundEmail._id}],
            limit: 20,
        });

        const transferEmails = new Map<string, ITransferEmail>();
        for (const transferEmail of [...byMessageId, ...byInboundEmail]) {
            transferEmails.set(transferEmail._id, transferEmail);
        }

        return [...transferEmails.values()];
    }

    private async markInboundEmailProcess(
        inboundEmail: IInboundEmail,
        status: InboundEmailProcessMarkStatus,
        options: {
            attempts?: number;
            lastError?: string;
            metadata?: Record<string, unknown>;
        } = {}
    ): Promise<void> {
        const currentMarks = inboundEmail.processMarks || [];
        const nextMark = this.removeUndefinedFields({
            key: TRANSFER_EMAIL_PROCESS_MARK_KEY,
            status,
            markedAt: new Date(),
            attempts: options.attempts,
            lastError: options.lastError,
            metadata: options.metadata,
        } satisfies IInboundEmailProcessMark);

        const processMarks = [
            ...currentMarks.filter((mark) => mark.key !== TRANSFER_EMAIL_PROCESS_MARK_KEY),
            nextMark,
        ];

        inboundEmail.processMarks = processMarks;
        await this.inboundMailService.updatePartial(inboundEmail._id, {processMarks});
    }

    private async buildTransferEmailPayloads(inboundEmail: IInboundEmail): Promise<ITransferEmailBase[]> {
        const extractionResult = await this.extractTransferDataWithAi(inboundEmail);

        if (!extractionResult.isTransferProof || extractionResult.transfers.length === 0) {
            return [];
        }

        const processDate = new Date();

        return await Promise.all(extractionResult.transfers.map(async (extraction) => {
            const emailFromName = this.normalizeString(extraction.affiliateName)
                || inboundEmail.customer?.name
                || this.normalizeString(inboundEmail.fromName);
            const emailFromEmail = this.normalizeString(extraction.affiliateEmail)
                || inboundEmail.customer?.email
                || this.normalizeString(inboundEmail.fromEmail);
            const emailDocumentNumber = this.normalizeDocumentNumber(
                extraction.emailDocumentNumber
                    || extraction.affiliateDocumentNumber
                    || inboundEmail.customer?.documentNumber
                    || this.extractDocumentNumberFromCuil(inboundEmail.customer?.cuil)
            );
            const additionalAffiliates = this.normalizeAdditionalAffiliates(extraction.additionalAffiliates);
            const amount = typeof extraction.amount === "number" && Number.isFinite(extraction.amount)
                ? extraction.amount
                : undefined;
            const currency = extraction.currency || undefined;
            const transferDate = this.parseTransferDate(extraction.transferDate);
            const originAccount = this.normalizeString(extraction.originAccount);
            const originCbu = this.normalizeString(extraction.originCbu);
            const affiliateResolution = await this.resolveAffiliateFromPayerMappings({
                emailFromName,
                emailFromEmail,
                emailDocumentNumber,
                originCbu,
                originAccount,
                additionalAffiliates,
            });
            const isMissingCriticalData = !amount || !affiliateResolution.affiliateDocumentNumber || !transferDate;

            const payload: ITransferEmailBase = {
                inboundEmail: inboundEmail._id,
                emailMessageId: inboundEmail.messageId,
                emailSubject: this.normalizeString(inboundEmail.subject),
                emailFromName,
                emailFromEmail,
                emailDocumentNumber,
                isTransferProof: true,
                amount,
                currency,
                transferDate,
                emailDate: inboundEmail.receivedAt,
                processDate,
                operationNumber: this.normalizeString(extraction.operationNumber),
                concept: this.normalizeString(extraction.concept),
                originAccount,
                originCbu,
                originAlias: this.normalizeString(extraction.originAlias),
                originBank: this.normalizeString(extraction.originBank),
                destinationAccount: this.normalizeString(extraction.destinationAccount),
                destinationCbu: this.normalizeString(extraction.destinationCbu),
                destinationAlias: this.normalizeString(extraction.destinationAlias),
                destinationBank: this.normalizeString(extraction.destinationBank),
                affiliateName: affiliateResolution.affiliateName,
                affiliateEmail: affiliateResolution.affiliateEmail,
                affiliateDocumentNumber: affiliateResolution.affiliateDocumentNumber,
                affiliateStrategy: affiliateResolution.affiliateStrategy,
                additionalAffiliates: affiliateResolution.additionalAffiliates,
                needsHumanReview: isMissingCriticalData || Boolean(extraction.needsHumanReview),
            };

            return this.removeUndefinedFields(payload);
        }));
    }

    private async resolveAffiliateFromPayerMappings(input: {
        emailFromName?: string;
        emailFromEmail?: string;
        emailDocumentNumber?: string;
        originCbu?: string;
        originAccount?: string;
        additionalAffiliates?: ITransferEmailBase["additionalAffiliates"];
    }): Promise<{
        affiliateName?: string;
        affiliateEmail?: string;
        affiliateDocumentNumber?: string;
        affiliateStrategy: TransferEmailAffiliateStrategy;
        additionalAffiliates?: ITransferEmailBase["additionalAffiliates"];
        payerFound: boolean;
        payerStrategy?: PayerStrategy;
    }> {
        const criteria = this.buildPayerLookupCriteria(input);
        const payers = await this.payerService.findByAnyStrategy(criteria);
        const payerMatch = this.findFirstPayerMatchByStrategyPriority(criteria, payers);

        if (payerMatch) {
            return {
                affiliateName: this.normalizeString(payerMatch.payer.affiliateName) || input.emailFromName,
                affiliateEmail: this.normalizeString(payerMatch.payer.affiliateEmail) || input.emailFromEmail,
                affiliateDocumentNumber: this.normalizeDocumentNumber(payerMatch.payer.affiliateDocumentNumber) || input.emailDocumentNumber,
                affiliateStrategy: payerMatch.strategy,
                additionalAffiliates: this.resolveAdditionalAffiliatesFromPayer(payerMatch.payer, input.additionalAffiliates),
                payerFound: true,
                payerStrategy: payerMatch.strategy,
            };
        }

        return {
            affiliateName: input.emailFromName,
            affiliateEmail: input.emailFromEmail,
            affiliateDocumentNumber: input.emailDocumentNumber,
            affiliateStrategy: EMAIL_DATA_AFFILIATE_STRATEGY,
            additionalAffiliates: input.additionalAffiliates,
            payerFound: false,
        };
    }

    private resolveReprocessedNeedsHumanReview(
        transferEmail: ITransferEmail,
        affiliateDocumentNumber?: string
    ): boolean {
        const wasMissingCriticalData = this.isMissingCriticalTransferData(
            transferEmail,
            transferEmail.affiliateDocumentNumber
        );

        if (transferEmail.needsHumanReview && !wasMissingCriticalData) {
            return true;
        }

        return this.isMissingCriticalTransferData(transferEmail, affiliateDocumentNumber);
    }

    private isMissingCriticalTransferData(
        transferEmail: Pick<ITransferEmail, "amount" | "transferDate">,
        affiliateDocumentNumber?: string
    ): boolean {
        return !transferEmail.amount || !affiliateDocumentNumber || !transferEmail.transferDate;
    }

    private hasAffiliateResolutionChanged(
        transferEmail: ITransferEmail,
        updatePayload: ITransferEmailBase
    ): boolean {
        return this.normalizeString(transferEmail.affiliateName) !== this.normalizeString(updatePayload.affiliateName)
            || this.normalizeString(transferEmail.affiliateEmail) !== this.normalizeString(updatePayload.affiliateEmail)
            || this.normalizeDocumentNumber(transferEmail.affiliateDocumentNumber) !== this.normalizeDocumentNumber(updatePayload.affiliateDocumentNumber)
            || transferEmail.affiliateStrategy !== updatePayload.affiliateStrategy
            || JSON.stringify(this.normalizeAdditionalAffiliates(transferEmail.additionalAffiliates)) !== JSON.stringify(this.normalizeAdditionalAffiliates(updatePayload.additionalAffiliates));
    }

    private buildReprocessChanges(
        transferEmail: ITransferEmail,
        updatePayload: ITransferEmailBase
    ): ReprocessTransferEmailChange[] {
        return [
            this.buildReprocessChange("affiliateName", "Afiliado", transferEmail.affiliateName, updatePayload.affiliateName),
            this.buildReprocessChange("affiliateEmail", "Email afiliado", transferEmail.affiliateEmail, updatePayload.affiliateEmail),
            this.buildReprocessChange("affiliateDocumentNumber", "DNI afiliado", transferEmail.affiliateDocumentNumber, updatePayload.affiliateDocumentNumber),
            this.buildReprocessChange("affiliateStrategy", "Estrategia", transferEmail.affiliateStrategy, updatePayload.affiliateStrategy),
            this.buildReprocessChange(
                "additionalAffiliates",
                "Afiliados adicionales",
                this.formatAdditionalAffiliates(transferEmail.additionalAffiliates),
                this.formatAdditionalAffiliates(updatePayload.additionalAffiliates)
            ),
        ].filter((change): change is ReprocessTransferEmailChange => Boolean(change));
    }

    private buildReprocessChange(
        field: string,
        label: string,
        before?: string | null,
        after?: string | null
    ): ReprocessTransferEmailChange | undefined {
        const formattedBefore = this.formatReprocessValue(before);
        const formattedAfter = this.formatReprocessValue(after);

        if (formattedBefore === formattedAfter) {
            return undefined;
        }

        return {
            field,
            label,
            before: formattedBefore,
            after: formattedAfter,
        };
    }

    private formatAdditionalAffiliates(additionalAffiliates?: ITransferEmailBase["additionalAffiliates"]): string {
        const formatted = (additionalAffiliates || [])
            .map((affiliate) => [
                affiliate.name,
                affiliate.email,
                affiliate.documentNumber,
            ].filter(Boolean).join(" / "))
            .filter(Boolean);

        return formatted.length > 0 ? formatted.join("; ") : "";
    }

    private formatReprocessValue(value?: string | null): string {
        return value || "-";
    }

    private resolveAdditionalAffiliatesFromPayer(
        payer: IPayer,
        fallbackAdditionalAffiliates?: ITransferEmailBase["additionalAffiliates"]
    ): ITransferEmailBase["additionalAffiliates"] {
        const payerAdditionalAffiliates = this.normalizeAdditionalAffiliates(payer.additionalAffiliates);
        return payerAdditionalAffiliates.length > 0
            ? payerAdditionalAffiliates
            : fallbackAdditionalAffiliates;
    }

    private buildPayerLookupCriteria(input: {
        emailFromEmail?: string;
        emailDocumentNumber?: string;
        originCbu?: string;
        originAccount?: string;
    }): IPayerLookupCriteria[] {
        return [
            this.buildPayerLookupCriterion("EMAIL", input.emailFromEmail),
            this.buildPayerLookupCriterion("DNI_CUIL", input.emailDocumentNumber),
            this.buildPayerLookupCriterion("CBU_CVU", input.originCbu),
            this.buildPayerLookupCriterion("NRO_CUENTA", input.originAccount),
        ].filter((criterion): criterion is IPayerLookupCriteria => Boolean(criterion));
    }

    private buildPayerLookupCriterion(strategy: PayerStrategy, value?: string): IPayerLookupCriteria | undefined {
        const normalizedValue = this.normalizeString(value);
        return normalizedValue ? {strategy, value: normalizedValue} : undefined;
    }

    private findFirstPayerMatchByStrategyPriority(
        criteria: IPayerLookupCriteria[],
        payers: IPayer[]
    ): { strategy: PayerStrategy; payer: IPayer } | undefined {
        for (const criterion of criteria) {
            const payer = payers.find((item) =>
                item.strategy === criterion.strategy
                && this.normalizeString(item.value) === criterion.value
            );

            if (payer) {
                return {strategy: criterion.strategy, payer};
            }
        }

        return undefined;
    }

    private async extractTransferDataWithAi(inboundEmail: IInboundEmail): Promise<TransferEmailAiResult> {
        try {
            const response = await this.aiProvider.prompt({
                operationTitle: "Transferencia",
                operationGroup: "inbound-mail-transfer",
                systemPrompt: [
                    "Sos un extractor de comprobantes de transferencias bancarias en Argentina.",
                    "Los mails y comprobantes analizados tienen localización Argentina: los miles se separan con punto (.) y los decimales con coma (,).",
                    "Debes decidir si el email corresponde a uno o mas comprobantes o avisos de transferencia bancaria y extraer todos los datos posibles.",
                    "Si el mail contiene transferencias para mas de un afiliado o mas de un comprobante, devuelve un item por cada transferencia en transfers.",
                    "Cada item de transfers debe representar una unica transferencia/comprobante y no debe mezclar datos entre comprobantes.",
                    "emailDocumentNumber es el DNI/CUIL/CUIT asociado al remitente o pagador identificado en el email.",
                    "affiliateName, affiliateEmail y affiliateDocumentNumber deben contener datos del remitente o pagador cuando aparezcan en el mail; el afiliado final se resuelve luego con mapeos de pagadores.",
                    "additionalAffiliates debe incluir otros afiliados pagados por la misma transferencia, con name, email y documentNumber cuando aparezcan.",
                    "Usa exclusivamente la evidencia disponible en asunto, cuerpo, texto normalizado, OCR de adjuntos y metadatos del remitente.",
                    "No inventes ni completes campos por inferencia débil.",
                    "Si un dato no está claro o no aparece, devuélvelo como null.",
                    "Si no es un comprobante de transferencia, devuelve isTransferProof=false y transfers=[].",
                    "Para transferDate devuelve una fecha ISO 8601 completa cuando sea posible en cada item.",
                    "affiliateDocumentNumber debe contener solo dígitos del DNI del remitente o pagador si aparece; no devuelvas CUIL/CUIT completo salvo que no puedas separar el DNI.",
                    "additionalAffiliates.documentNumber tambien debe contener solo digitos del DNI si aparece.",
                    "needsHumanReview debe ser true siempre que falte affiliateDocumentNumber, amount o transferDate.",
                    "Tambien debe ser true cuando haya ambigüedad relevante, aunque esos tres datos esten presentes.",
                ].join("\n"),
                userInput: this.buildAiUserInput(inboundEmail),
                zodSchema: transferEmailAiSchema,
                toolMaxIterations: this.aiToolMaxIterations,
            });

            return this.parseAiOutput(response.output);
        } catch (error) {
            this.logError("Error extracting transfer data with AI", error, {
                inboundEmailId: inboundEmail._id,
                messageId: inboundEmail.messageId,
                subject: inboundEmail.subject,
                aiProvider: resolveAiProviderName(),
                toolMaxIterations: this.aiToolMaxIterations,
            });
            throw error;
        }
    }

    private buildAiUserInput(inboundEmail: IInboundEmail): string {
        const sections = [
            this.buildSection("EMAIL METADATA", [
                `messageId: ${inboundEmail.messageId}`,
                `receivedAt: ${this.toIsoString(inboundEmail.receivedAt)}`,
                `fromName: ${inboundEmail.fromName}`,
                `fromEmail: ${inboundEmail.fromEmail}`,
                `subject: ${inboundEmail.subject}`,
                `category: ${inboundEmail.category}`,
                `tags: ${(inboundEmail.tags || []).join(", ")}`,
                `hasAttachments: ${String(Boolean(inboundEmail.hasAttachments))}`,
                `attachmentCount: ${String(inboundEmail.attachmentCount || 0)}`,
            ]),
            this.buildSection("EXTRACTED CUSTOMER DATA", [
                `name: ${inboundEmail.customer?.name}`,
                `email: ${inboundEmail.customer?.email}`,
                `documentNumber: ${inboundEmail.customer?.documentNumber}`,
                `cuil: ${inboundEmail.customer?.cuil}`,
            ]),
            this.buildSection("BODY TEXT", [inboundEmail.bodyText]),
            this.buildSection("NORMALIZED TEXT", [inboundEmail.normalizedText]),
            this.buildSection("ATTACHMENTS OCR", [inboundEmail.attachmentsOcrText]),
        ];

        return sections.filter(Boolean).join("\n\n");
    }

    private buildSection(title: string, values: Array<string | undefined | null>): string {
        const content = values
            .map((value) => value?.trim())
            .filter((value): value is string => Boolean(value))
            .join("\n");

        return content ? `[${title}]\n${content}` : "";
    }

    private parseAiOutput(output: unknown): TransferEmailAiResult {
        if (typeof output === "string") {
            const parsed = JSON.parse(output);
            return transferEmailAiSchema.parse(parsed);
        }

        return transferEmailAiSchema.parse(output);
    }

    private parseTransferDate(value?: string | null): Date | undefined {
        if (!value) {
            return undefined;
        }

        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }

    private normalizeDocumentNumber(value?: string | null): string | undefined {
        const digits = value?.replace(/\D/g, "");
        if (!digits) {
            return undefined;
        }
        if (digits.length === 11) {
            return digits.slice(2, 10);
        }
        return digits;
    }

    private extractDocumentNumberFromCuil(value?: string | null): string | undefined {
        const digits = value?.replace(/\D/g, "");
        if (digits && digits.length === 11) {
            return digits.slice(2, 10);
        }
        return undefined;
    }

    private normalizeAdditionalAffiliates(additionalAffiliates?: Array<{
        name?: string | null;
        email?: string | null;
        documentNumber?: string | null;
    }> | null): ITransferEmailBase["additionalAffiliates"] {
        return (additionalAffiliates || [])
            .map((affiliate) => this.removeUndefinedFields({
                name: this.normalizeString(affiliate.name),
                email: this.normalizeString(affiliate.email),
                documentNumber: this.normalizeDocumentNumber(affiliate.documentNumber),
            }))
            .filter((affiliate) => affiliate.name || affiliate.email || affiliate.documentNumber);
    }

    private normalizeString(value?: string | null): string | undefined {
        const normalized = value?.trim();
        return normalized ? normalized : undefined;
    }

    private toIsoString(value?: Date | string | null): string {
        if (!value) {
            return "";
        }
        const parsedDate = value instanceof Date ? value : new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString();
    }

    private removeUndefinedFields<T extends object>(payload: T): T {
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
        ) as T;
    }

    private async isSettingEnabled(key: string): Promise<boolean> {
        try {
            const setting = await SettingServiceFactory().findByKey(key);
            return setting?.value === true || setting?.value === "true";
        } catch (error) {
            this.logError("Error reading inbound transfer automation setting", error, {settingKey: key});
            return false;
        }
    }

    private async getTransferEmailCategoryFilter(): Promise<string | null> {
        try {
            const setting = await SettingServiceFactory().findByKey(INBOUND_MAIL_TRANSFER_CATEGORY_SETTING_KEY);
            const category = typeof setting?.value === "string" ? setting.value.trim() : "";
            return category || null;
        } catch (error) {
            this.logError("Error reading inbound transfer category setting", error, {
                settingKey: INBOUND_MAIL_TRANSFER_CATEGORY_SETTING_KEY,
            });
            return null;
        }
    }

    private readNumberEnv(key: string, fallback: number): number {
        const value = process.env[key];
        if (!value) {
            return fallback;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }

    private logError(message: string, error: unknown, context?: Record<string, unknown>): void {
        console.error(`[InboundMailTransferProcessor] ${message}`, {
            context,
            error: this.serializeError(error),
        });
    }

    private serializeErrorMessage(error: unknown): string {
        if (error instanceof z.ZodError) {
            return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        }

        if (error instanceof Error) {
            return error.message;
        }

        if (typeof error === "string") {
            return error;
        }

        try {
            return JSON.stringify(error);
        } catch {
            return "Unknown error";
        }
    }

    private serializeError(error: unknown): unknown {
        if (error instanceof z.ZodError) {
            return {
                name: error.name,
                message: error.message,
                issues: error.issues,
                stack: error.stack,
            };
        }

        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }

        if (typeof error === "string" || error === undefined || error === null) {
            return error;
        }

        try {
            return JSON.parse(JSON.stringify(error));
        } catch {
            return String(error);
        }
    }
}

export default InboundMailTransferProcessor;
export {InboundMailTransferProcessor};
export type {ReprocessTransferEmailResult};
