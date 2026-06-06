import InboundEmailServiceFactory from "../../mail/factory/services/InboundEmailServiceFactory.js";
import { AiProviderFactory } from "@drax/ai-back";
import { SettingServiceFactory } from "@drax/settings-back";
import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
import { z } from "zod";
const DEFAULT_PROCESS_LIMIT = 10;
const DEFAULT_PROCESS_INTERVAL_MS = 60000;
const INBOUND_MAIL_TRANSFER_AUTO_PROCESS_SETTING_KEY = "InboundMailTransferAutoProcess";
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
    needsHumanReview: z.boolean().nullable(),
    reasoning: z.string().nullable(),
});
const transferEmailAiSchema = z.object({
    isTransferProof: z.boolean(),
    transfers: z.array(transferEmailAiItemSchema),
    needsHumanReview: z.boolean().nullable(),
    reasoning: z.string().nullable(),
});
const DEFAULT_AI_PROVIDER = "OllamaAi";
function resolveAiProviderName() {
    return process.env.AI_PROVIDER || DEFAULT_AI_PROVIDER;
}
class InboundMailTransferProcessor {
    constructor(inboundMailService = InboundEmailServiceFactory.instance, transferEmailService = TransferEmailServiceFactory.instance, openAiProvider = AiProviderFactory.instance(resolveAiProviderName())) {
        this.processInProgress = false;
        this.inboundMailService = inboundMailService;
        this.transferEmailService = transferEmailService;
        this.aiProvider = openAiProvider;
        this.processIntervalMs = this.readNumberEnv("INBOUND_MAIL_TRANSFER_PROCESS_INTERVAL_MS", DEFAULT_PROCESS_INTERVAL_MS);
    }
    static get instance() {
        if (!InboundMailTransferProcessor.singleton) {
            InboundMailTransferProcessor.singleton = new InboundMailTransferProcessor();
        }
        return InboundMailTransferProcessor.singleton;
    }
    start() {
        this.startTransferAutoProcessInterval();
    }
    stop() {
        this.stopTransferAutoProcessInterval();
    }
    startTransferAutoProcessInterval(intervalMs = this.processIntervalMs) {
        if (this.processTimer) {
            return;
        }
        void this.runTransferAutoProcess();
        this.processTimer = setInterval(() => {
            void this.runTransferAutoProcess();
        }, intervalMs);
    }
    stopTransferAutoProcessInterval() {
        if (this.processTimer) {
            clearInterval(this.processTimer);
            this.processTimer = undefined;
        }
    }
    async process(options = {}) {
        const limit = this.resolveLimitOption(options.limit);
        const requestedSince = this.resolveSinceOption(options.since);
        if (this.processInProgress) {
            return {
                since: requestedSince,
                limit,
                scanned: 0,
                created: 0,
                skipped: 0,
            };
        }
        this.processInProgress = true;
        try {
            const since = requestedSince ?? await this.getProcessingStartDate();
            const inboundEmails = await this.findInboundEmailsToProcess(since, limit);
            return {
                since,
                limit,
                ...await this.processInboundEmailBatch(inboundEmails),
            };
        }
        finally {
            this.processInProgress = false;
        }
    }
    async processInboundEmails(options = {}) {
        return this.process(options);
    }
    async processInboundEmailBatch(inboundEmails) {
        if (inboundEmails.length === 0) {
            return {
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
            const transferEmails = await this.buildTransferEmailPayloads(inboundEmail);
            if (transferEmails.length === 0) {
                skipped++;
                continue;
            }
            for (const transferEmail of transferEmails) {
                await this.transferEmailService.create(transferEmail);
                created++;
            }
        }
        return {
            scanned: inboundEmails.length,
            created,
            skipped,
        };
    }
    async runTransferAutoProcess() {
        if (!await this.isSettingEnabled(INBOUND_MAIL_TRANSFER_AUTO_PROCESS_SETTING_KEY)) {
            return;
        }
        try {
            await this.process();
        }
        catch (error) {
            this.logError("Error processing inbound transfer emails", error);
        }
    }
    resolveSinceOption(since) {
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
    resolveLimitOption(limit) {
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
    async getProcessingStartDate() {
        const latestTransferEmails = await this.transferEmailService.paginate({
            page: 1,
            limit: 1,
            orderBy: "createdAt",
            order: "desc",
        });
        const latestTransferEmail = latestTransferEmails.items[0];
        if (!latestTransferEmail) {
            return null;
        }
        const inboundReceivedAt = typeof latestTransferEmail.inboundEmail === "object"
            ? latestTransferEmail.inboundEmail?.receivedAt
            : undefined;
        return inboundReceivedAt
            || latestTransferEmail.emailDate
            || latestTransferEmail.transferDate
            || latestTransferEmail.createdAt
            || null;
    }
    async findInboundEmailsToProcess(since, limit) {
        const filters = [
            { field: "processingStatus", operator: "eq", value: "PROCESSED" },
        ];
        if (since) {
            filters.push({ field: "receivedAt", operator: "gte", value: since });
        }
        return await this.inboundMailService.find({
            orderBy: "receivedAt",
            order: "asc",
            filters,
            limit,
        });
    }
    async findExistingTransferInboundIds(inboundEmailIds) {
        if (inboundEmailIds.length === 0) {
            return new Set();
        }
        const existing = await this.transferEmailService.find({
            filters: [{ field: "inboundEmail", operator: "in", value: inboundEmailIds }],
            limit: Math.max(inboundEmailIds.length * 20, inboundEmailIds.length),
        });
        return new Set(existing
            .map((item) => {
            if (!item.inboundEmail) {
                return undefined;
            }
            if (typeof item.inboundEmail === "string") {
                return item.inboundEmail;
            }
            return item.inboundEmail._id;
        })
            .filter((value) => Boolean(value)));
    }
    async buildTransferEmailPayloads(inboundEmail) {
        const extractionResult = await this.extractTransferDataWithAi(inboundEmail);
        if (!extractionResult.isTransferProof || extractionResult.transfers.length === 0) {
            return [];
        }
        const processDate = new Date();
        return extractionResult.transfers.map((extraction) => {
            const affiliateDocumentNumber = this.normalizeDocumentNumber(extraction.affiliateDocumentNumber
                || inboundEmail.customer?.documentNumber
                || this.extractDocumentNumberFromCuil(inboundEmail.customer?.cuil));
            const affiliateEmail = this.normalizeString(extraction.affiliateEmail) || inboundEmail.customer?.email || inboundEmail.fromEmail;
            const amount = typeof extraction.amount === "number" && Number.isFinite(extraction.amount)
                ? extraction.amount
                : undefined;
            const currency = extraction.currency || undefined;
            const transferDate = this.parseTransferDate(extraction.transferDate);
            const payload = {
                inboundEmail: inboundEmail._id,
                emailMessageId: inboundEmail.messageId,
                emailSubject: this.normalizeString(inboundEmail.subject),
                emailFromName: this.normalizeString(inboundEmail.fromName),
                emailFromEmail: this.normalizeString(inboundEmail.fromEmail),
                isTransferProof: true,
                amount,
                currency,
                transferDate,
                emailDate: inboundEmail.receivedAt,
                processDate,
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
                needsHumanReview: extraction.needsHumanReview ?? (!amount || !affiliateDocumentNumber || !transferDate),
            };
            return this.removeUndefinedFields(payload);
        });
    }
    async extractTransferDataWithAi(inboundEmail) {
        const response = await this.aiProvider.prompt({
            operationTitle: "Transferencia",
            systemPrompt: [
                "Sos un extractor de comprobantes de transferencias bancarias en Argentina.",
                "Debes decidir si el email corresponde a uno o mas comprobantes o avisos de transferencia bancaria y extraer todos los datos posibles.",
                "Si el mail contiene transferencias para mas de un afiliado o mas de un comprobante, devuelve un item por cada transferencia en transfers.",
                "Cada item de transfers debe representar una unica transferencia/comprobante y no debe mezclar datos entre comprobantes.",
                "Usa exclusivamente la evidencia disponible en asunto, cuerpo, texto normalizado, OCR de adjuntos y metadatos del remitente.",
                "No inventes ni completes campos por inferencia débil.",
                "Si un dato no está claro o no aparece, devuélvelo como null.",
                "Si no es un comprobante de transferencia, devuelve isTransferProof=false y transfers=[].",
                "Para transferDate devuelve una fecha ISO 8601 completa cuando sea posible en cada item.",
                "affiliateDocumentNumber debe contener solo dígitos del DNI si aparece; no devuelvas CUIL/CUIT completo salvo que no puedas separar el DNI.",
                "needsHumanReview debe ser true cuando falten datos clave o haya ambigüedad relevante.",
            ].join("\n"),
            userInput: this.buildAiUserInput(inboundEmail),
            zodSchema: transferEmailAiSchema,
        });
        return this.parseAiOutput(response.output);
    }
    buildAiUserInput(inboundEmail) {
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
    buildSection(title, values) {
        const content = values
            .map((value) => value?.trim())
            .filter((value) => Boolean(value))
            .join("\n");
        return content ? `[${title}]\n${content}` : "";
    }
    parseAiOutput(output) {
        if (typeof output === "string") {
            const parsed = JSON.parse(output);
            return transferEmailAiSchema.parse(parsed);
        }
        return transferEmailAiSchema.parse(output);
    }
    parseTransferDate(value) {
        if (!value) {
            return undefined;
        }
        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }
    normalizeDocumentNumber(value) {
        const digits = value?.replace(/\D/g, "");
        if (!digits) {
            return undefined;
        }
        if (digits.length === 11) {
            return digits.slice(2, 10);
        }
        return digits;
    }
    extractDocumentNumberFromCuil(value) {
        const digits = value?.replace(/\D/g, "");
        if (digits && digits.length === 11) {
            return digits.slice(2, 10);
        }
        return undefined;
    }
    normalizeString(value) {
        const normalized = value?.trim();
        return normalized ? normalized : undefined;
    }
    toIsoString(value) {
        if (!value) {
            return "";
        }
        const parsedDate = value instanceof Date ? value : new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString();
    }
    removeUndefinedFields(payload) {
        return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    }
    async isSettingEnabled(key) {
        try {
            const setting = await SettingServiceFactory().findByKey(key);
            return setting?.value === true || setting?.value === "true";
        }
        catch (error) {
            this.logError("Error reading inbound transfer automation setting", error, { settingKey: key });
            return false;
        }
    }
    readNumberEnv(key, fallback) {
        const value = process.env[key];
        if (!value) {
            return fallback;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }
    logError(message, error, context) {
        console.error(`[InboundMailTransferProcessor] ${message}`, {
            context,
            error: this.serializeError(error),
        });
    }
    serializeError(error) {
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
        }
        catch {
            return String(error);
        }
    }
}
export default InboundMailTransferProcessor;
export { InboundMailTransferProcessor };
