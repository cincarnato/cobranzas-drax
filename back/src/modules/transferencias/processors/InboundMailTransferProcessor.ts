import InboundEmailServiceFactory from "../../mail/factory/services/InboundEmailServiceFactory.js";
import type {IInboundEmail} from "../../mail/interfaces/IInboundEmail.js";
import InboundEmailService from "../../mail/services/InboundEmailService.js";
import type {IAIProvider} from "@drax/ai-back";
import {OpenAiProviderFactory} from "@drax/ai-back";
import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
import type {ITransferEmail, ITransferEmailBase} from "../interfaces/ITransferEmail.js";
import TransferEmailService from "../services/TransferEmailService.js";
import {z} from "zod";

type ProcessTransfersResult = {
    since: Date | null;
    scanned: number;
    created: number;
    skipped: number;
};

const transferEmailAiSchema = z.object({
    isTransferProof: z.boolean(),
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
    needsHumanReview: z.boolean().nullable(),
    reasoning: z.string().nullable(),
});

type TransferEmailAiExtraction = z.infer<typeof transferEmailAiSchema>;

class InboundMailTransferProcessor {
    private inboundMailService: InboundEmailService;
    private transferEmailService: TransferEmailService;
    private openAiProvider: IAIProvider;

    constructor(
        inboundMailService: InboundEmailService = InboundEmailServiceFactory.instance,
        transferEmailService: TransferEmailService = TransferEmailServiceFactory.instance,
        openAiProvider: IAIProvider = OpenAiProviderFactory.instance()
    ) {
        this.inboundMailService = inboundMailService;
        this.transferEmailService = transferEmailService;
        this.openAiProvider = openAiProvider;
    }

    async process(): Promise<ProcessTransfersResult> {
        const since = await this.getProcessingStartDate();
        const inboundEmails = await this.findInboundEmailsToProcess(since);

        if (inboundEmails.length === 0) {
            return {
                since,
                scanned: 0,
                created: 0,
                skipped: 0,
            };
        }

        const existingInboundIds = await this.findExistingTransferInboundIds(inboundEmails.map((email) => email._id));

        let created = 0;
        let skipped = 0;

        for (const inboundEmail of inboundEmails) {
            if (existingInboundIds.has(inboundEmail._id)) {
                skipped++;
                continue;
            }

            const transferEmail = await this.buildTransferEmailPayload(inboundEmail);
            if (!transferEmail) {
                skipped++;
                continue;
            }

            await this.transferEmailService.create(transferEmail);
            created++;
        }

        return {
            since,
            scanned: inboundEmails.length,
            created,
            skipped,
        };
    }

    async processInboundEmails(): Promise<ProcessTransfersResult> {
        return this.process();
    }

    private async getProcessingStartDate(): Promise<Date | null> {
        const latestTransferEmails = await this.transferEmailService.paginate({
            page: 1,
            limit: 1,
            orderBy: "createdAt",
            order: "desc",
        });

        const latestTransferEmail = latestTransferEmails.items[0] as (ITransferEmail & {
            inboundEmail?: { receivedAt?: Date } | string | null;
        }) | undefined;

        if (!latestTransferEmail) {
            return null;
        }

        const inboundReceivedAt = typeof latestTransferEmail.inboundEmail === "object"
            ? latestTransferEmail.inboundEmail?.receivedAt
            : undefined;

        return inboundReceivedAt
            || latestTransferEmail.transferDate
            || latestTransferEmail.createdAt
            || null;
    }

    private async findInboundEmailsToProcess(since: Date | null): Promise<IInboundEmail[]> {
        const filters: Array<{ field: string; operator: string; value: unknown }> = [
            {field: "processingStatus", operator: "eq", value: "PROCESSED"},
        ];

        if (since) {
            filters.push({field: "receivedAt", operator: "gte", value: since});
        }

        return await this.inboundMailService.find({
            orderBy: "receivedAt",
            order: "asc",
            filters,
        });
    }

    private async findExistingTransferInboundIds(inboundEmailIds: string[]): Promise<Set<string>> {
        if (inboundEmailIds.length === 0) {
            return new Set<string>();
        }

        const existing = await this.transferEmailService.find({
            filters: [{field: "inboundEmail", operator: "in", value: inboundEmailIds}],
            limit: inboundEmailIds.length,
        });

        return new Set(
            existing
                .map((item) => {
                    if (!item.inboundEmail) {
                        return undefined;
                    }

                    if (typeof item.inboundEmail === "string") {
                        return item.inboundEmail;
                    }

                    return item.inboundEmail._id;
                })
                .filter((value): value is string => Boolean(value))
        );
    }

    private async buildTransferEmailPayload(inboundEmail: IInboundEmail): Promise<ITransferEmailBase | null> {
        const extraction = await this.extractTransferDataWithAi(inboundEmail);

        if (!extraction.isTransferProof) {
            return null;
        }

        const affiliateDocumentNumber = this.normalizeDocumentNumber(
            extraction.affiliateDocumentNumber
                || inboundEmail.customer?.documentNumber
                || this.extractDocumentNumberFromCuil(inboundEmail.customer?.cuil)
        );
        const affiliateEmail = this.normalizeString(extraction.affiliateEmail) || inboundEmail.customer?.email || inboundEmail.fromEmail;
        const amount = typeof extraction.amount === "number" && Number.isFinite(extraction.amount)
            ? extraction.amount
            : undefined;
        const currency = extraction.currency || undefined;
        const transferDate = this.parseTransferDate(extraction.transferDate) || inboundEmail.receivedAt;

        const payload: ITransferEmailBase = {
            inboundEmail: inboundEmail._id,
            isTransferProof: true,
            amount,
            currency,
            transferDate,
            operationNumber: this.normalizeString(extraction.operationNumber),
            concept: this.normalizeString(extraction.concept),
            originAccount: this.normalizeString(extraction.originAccount),
            originCbu: this.normalizeString(extraction.originCbu),
            originAlias: this.normalizeString(extraction.originAlias),
            originBank: this.normalizeString(extraction.originBank),
            destinationAccount: this.normalizeString(extraction.destinationAccount),
            destinationCbu: this.normalizeString(extraction.destinationCbu),
            destinationAlias: this.normalizeString(extraction.destinationAlias),
            destinationBank: this.normalizeString(extraction.destinationBank),
            affiliateName: this.normalizeString(extraction.affiliateName) || inboundEmail.customer?.name || inboundEmail.fromName,
            affiliateEmail,
            affiliateDocumentNumber,
            needsHumanReview: extraction.needsHumanReview ?? (!amount || !affiliateDocumentNumber),
        };

        return this.removeUndefinedFields(payload);
    }

    private async extractTransferDataWithAi(inboundEmail: IInboundEmail): Promise<TransferEmailAiExtraction> {
        const response = await this.openAiProvider.prompt({
            systemPrompt: [
                "Sos un extractor de comprobantes de transferencias bancarias en Argentina.",
                "Debes decidir si el email corresponde a un comprobante o aviso de transferencia bancaria y extraer todos los datos posibles.",
                "Usa exclusivamente la evidencia disponible en asunto, cuerpo, texto normalizado, OCR de adjuntos y metadatos del remitente.",
                "No inventes ni completes campos por inferencia débil.",
                "Si un dato no está claro o no aparece, devuélvelo como null.",
                "Si no es un comprobante de transferencia, devuelve isTransferProof=false y el resto null.",
                "Para transferDate devuelve una fecha ISO 8601 completa cuando sea posible.",
                "affiliateDocumentNumber debe contener solo dígitos del DNI si aparece; no devuelvas CUIL/CUIT completo salvo que no puedas separar el DNI.",
                "needsHumanReview debe ser true cuando falten datos clave o haya ambigüedad relevante.",
            ].join("\n"),
            userInput: this.buildAiUserInput(inboundEmail),
            zodSchema: transferEmailAiSchema,
        });

        return this.parseAiOutput(response.output);
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

    private parseAiOutput(output: unknown): TransferEmailAiExtraction {
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

    private removeUndefinedFields(payload: ITransferEmailBase): ITransferEmailBase {
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
        ) as ITransferEmailBase;
    }
}

export default InboundMailTransferProcessor;
export {InboundMailTransferProcessor};
