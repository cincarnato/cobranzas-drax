import InboundEmailServiceFactory from "../../mail/factory/services/InboundEmailServiceFactory.js";
import { AiProviderFactory } from "@drax/ai-back";
import { SettingServiceFactory } from "@drax/settings-back";
import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
import PayerServiceFactory from "../factory/services/PayerServiceFactory.js";
import { extractTransferEmailFallback } from "./TransferEmailFallbackExtractor.js";
import { z } from "zod";
const DEFAULT_PROCESS_LIMIT = 10;
const DEFAULT_PROCESS_INTERVAL_MS = 60000;
const DEFAULT_AI_TOOL_MAX_ITERATIONS = 10;
const INBOUND_MAIL_TRANSFER_AUTO_PROCESS_SETTING_KEY = "InboundMailTransferAutoProcess";
const INBOUND_MAIL_TRANSFER_CATEGORY_SETTING_KEY = "InboundMailTransferCategory";
const TRANSFER_EMAIL_PROCESS_MARK_KEY = "transfer-email";
const TRANSFER_EMAIL_MAX_PROCESS_ATTEMPTS = 2;
const EMAIL_DATA_AFFILIATE_STRATEGY = "EMAIL_DATA";
const transferEmailAiAdditionalAffiliateSchema = z.object({
    name: z.string().nullable(),
    email: z.string().nullable().optional(),
    amount: z.number().nullable(),
    documentNumber: z.string().nullable(),
});
const transferEmailAiItemSchema = z.object({
    amount: z.number().nullable(),
    currency: z.enum(["ARS", "USD", "EUR", "OTHER"]).nullable(),
    transferDate: z.string().nullable(),
    operationNumber: z.string().nullable(),
    concept: z.string().nullable(),
    originName: z.string().nullable().optional().default(null),
    originAccount: z.string().nullable(),
    originCbu: z.string().nullable(),
    originAlias: z.string().nullable(),
    originBank: z.string().nullable(),
    destinationName: z.string().nullable().optional().default(null),
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
    hasAdditionalInquiry: z.boolean().nullable(),
    reasoning: z.string().nullable(),
});
const DEFAULT_AI_PROVIDER = "OllamaAi";
function resolveAiProviderName() {
    return process.env.AI_PROVIDER || DEFAULT_AI_PROVIDER;
}
class InboundMailTransferProcessor {
    constructor(inboundMailService = InboundEmailServiceFactory.instance, transferEmailService = TransferEmailServiceFactory.instance, openAiProvider = AiProviderFactory.instance(resolveAiProviderName()), payerService = PayerServiceFactory.instance) {
        this.processInProgress = false;
        this.inboundMailService = inboundMailService;
        this.transferEmailService = transferEmailService;
        this.aiProvider = openAiProvider;
        this.payerService = payerService;
        this.processIntervalMs = this.readNumberEnv("INBOUND_MAIL_TRANSFER_PROCESS_INTERVAL_MS", DEFAULT_PROCESS_INTERVAL_MS);
        this.aiToolMaxIterations = this.readNumberEnv("INBOUND_MAIL_TRANSFER_AI_TOOL_MAX_ITERATIONS", DEFAULT_AI_TOOL_MAX_ITERATIONS);
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
        }
        finally {
            this.processInProgress = false;
        }
    }
    async processInboundEmails(options = {}) {
        return this.process(options);
    }
    async processInboundEmail(inboundEmailId) {
        const inboundEmail = await this.inboundMailService.findById(inboundEmailId);
        if (!inboundEmail) {
            throw new Error("Inbound email not found");
        }
        const existingTransferEmails = await this.findExistingTransferEmails(inboundEmail);
        if (existingTransferEmails.length > 0) {
            await this.markInboundEmailProcess(inboundEmail, "SUCCESS", {
                attempts: this.resolveCurrentTransferEmailAttempts(inboundEmail),
                metadata: {
                    reason: "existing-transfer-email",
                    transferEmailIds: existingTransferEmails.map((transferEmail) => transferEmail._id),
                },
            });
            return {
                inboundEmailId: inboundEmail._id,
                transferEmails: existingTransferEmails,
                created: 0,
                existing: existingTransferEmails.length,
                skipped: true,
                reason: "existing-transfer-email",
            };
        }
        const attempts = this.resolveNextTransferEmailAttempt(inboundEmail);
        await this.markInboundEmailProcess(inboundEmail, "PROCESSING", { attempts });
        try {
            const transferEmailBuildResult = await this.buildTransferEmailPayloadsResult(inboundEmail);
            if (transferEmailBuildResult.payloads.length === 0) {
                await this.markInboundEmailProcess(inboundEmail, "SKIPPED", {
                    attempts,
                    metadata: {
                        reason: transferEmailBuildResult.reason,
                        details: transferEmailBuildResult.details,
                    },
                });
                return {
                    inboundEmailId: inboundEmail._id,
                    transferEmails: [],
                    created: 0,
                    existing: 0,
                    skipped: true,
                    reason: transferEmailBuildResult.reason,
                    message: transferEmailBuildResult.message,
                    details: transferEmailBuildResult.details,
                };
            }
            const transferEmails = await this.createTransferEmails(transferEmailBuildResult.payloads);
            await this.markInboundEmailProcess(inboundEmail, "SUCCESS", {
                attempts,
                metadata: { transferEmailIds: transferEmails.map((transferEmail) => transferEmail._id) },
            });
            return {
                inboundEmailId: inboundEmail._id,
                transferEmails,
                created: transferEmails.length,
                existing: 0,
                skipped: false,
            };
        }
        catch (error) {
            const fallbackTransferEmail = await this.transferEmailService.create(this.buildManualTransferEmailPayload(inboundEmail, error));
            await this.markInboundEmailProcess(inboundEmail, "SUCCESS", {
                attempts,
                metadata: {
                    reason: "manual-transfer-created-after-ai-error",
                    transferEmailIds: [fallbackTransferEmail._id],
                    aiError: this.serializeErrorMessage(error),
                },
            });
            return {
                inboundEmailId: inboundEmail._id,
                transferEmails: [fallbackTransferEmail],
                created: 1,
                existing: 0,
                skipped: false,
                reason: "manual-transfer-created-after-ai-error",
                message: "La IA no pudo procesar el mail. Se creó un registro mínimo para que pueda completarse manualmente.",
                details: this.serializeErrorMessage(error),
            };
        }
    }
    async reprocessTransferEmail(transferEmailId) {
        const transferEmail = await this.transferEmailService.findById(transferEmailId);
        if (!transferEmail) {
            throw new Error("Transfer email not found");
        }
        try {
            const affiliateResolution = await this.resolveAffiliateFromPayerMappings({
                emailFromName: this.normalizeString(transferEmail.emailFromName),
                emailFromEmail: this.normalizeString(transferEmail.emailFromEmail),
                emailDocumentNumber: this.normalizeDocumentNumber(transferEmail.emailDocumentNumber),
                originCbu: this.normalizeString(transferEmail.originCbu),
                originAccount: this.normalizeString(transferEmail.originAccount),
                affiliates: this.normalizeAffiliates(transferEmail.affiliates),
                amount: transferEmail.amount,
            });
            const aiProcessedAt = new Date();
            const aiStatus = this.resolveAiStatus({
                amount: transferEmail.amount,
                transferDate: transferEmail.transferDate,
                affiliates: affiliateResolution.affiliates,
                needsHumanReview: transferEmail.needsHumanReview,
            });
            const updatePayload = this.removeUndefinedFields({
                affiliateStrategy: affiliateResolution.affiliateStrategy,
                payer: affiliateResolution.payer?._id || null,
                affiliates: affiliateResolution.affiliates,
                processDate: aiProcessedAt,
                aiStatus,
                aiProcessedAt,
                aiError: undefined,
                status: this.resolvePendingAuditStatus(transferEmail.status),
                needsHumanReview: this.resolveNeedsHumanReviewFromAiStatus(aiStatus),
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
                payer: affiliateResolution.payer,
                payerStrategy: affiliateResolution.payerStrategy,
                previousAffiliateStrategy: transferEmail.affiliateStrategy,
                currentAffiliateStrategy: updatedTransferEmail.affiliateStrategy,
            };
        }
        catch (error) {
            await this.markTransferEmailAiError(transferEmail, error);
            throw error;
        }
    }
    async processInboundEmailBatch(inboundEmails) {
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
                await this.markInboundEmailProcess(inboundEmail, "PROCESSING", { attempts });
                const transferEmails = await this.buildTransferEmailPayloads(inboundEmail);
                if (transferEmails.length === 0) {
                    await this.markInboundEmailProcess(inboundEmail, "SKIPPED", {
                        attempts,
                        metadata: { reason: "not-transfer-proof" },
                    });
                    skipped++;
                    continue;
                }
                const createdTransferEmails = await this.createTransferEmails(transferEmails);
                created += createdTransferEmails.length;
                await this.markInboundEmailProcess(inboundEmail, "SUCCESS", {
                    attempts,
                    metadata: { transferEmailIds: createdTransferEmails.map((transferEmail) => transferEmail._id) },
                });
            }
            catch (error) {
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
    async findInboundEmailsToProcess(since, limit) {
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
    findTransferEmailProcessMark(inboundEmail) {
        return inboundEmail.processMarks?.find((mark) => mark.key === TRANSFER_EMAIL_PROCESS_MARK_KEY);
    }
    resolveCurrentTransferEmailAttempts(inboundEmail) {
        return this.findTransferEmailProcessMark(inboundEmail)?.attempts || 0;
    }
    resolveNextTransferEmailAttempt(inboundEmail) {
        return this.resolveCurrentTransferEmailAttempts(inboundEmail) + 1;
    }
    async findExistingTransferEmails(inboundEmail) {
        const byMessageId = await this.transferEmailService.find({
            filters: [{ field: "emailMessageId", operator: "eq", value: inboundEmail.messageId }],
            limit: 20,
        });
        const byInboundEmail = await this.transferEmailService.find({
            filters: [{ field: "inboundEmail", operator: "eq", value: inboundEmail._id }],
            limit: 20,
        });
        const transferEmails = new Map();
        for (const transferEmail of [...byMessageId, ...byInboundEmail]) {
            transferEmails.set(transferEmail._id, transferEmail);
        }
        return [...transferEmails.values()];
    }
    async markInboundEmailProcess(inboundEmail, status, options = {}) {
        const currentMarks = inboundEmail.processMarks || [];
        const nextMark = this.removeUndefinedFields({
            key: TRANSFER_EMAIL_PROCESS_MARK_KEY,
            status,
            markedAt: new Date(),
            attempts: options.attempts,
            lastError: options.lastError,
            metadata: options.metadata,
        });
        const processMarks = [
            ...currentMarks.filter((mark) => mark.key !== TRANSFER_EMAIL_PROCESS_MARK_KEY),
            nextMark,
        ];
        inboundEmail.processMarks = processMarks;
        await this.inboundMailService.updatePartial(inboundEmail._id, { processMarks });
    }
    async buildTransferEmailPayloads(inboundEmail) {
        return (await this.buildTransferEmailPayloadsResult(inboundEmail)).payloads;
    }
    async buildTransferEmailPayloadsResult(inboundEmail) {
        const extractionResult = await this.extractTransferData(inboundEmail);
        if (!extractionResult.isTransferProof) {
            return {
                payloads: [],
                reason: extractionResult.extractionSource === "FALLBACK" ? "fallback-not-transfer-proof" : "not-transfer-proof",
                message: extractionResult.extractionSource === "FALLBACK"
                    ? "La IA no respondió y el fallback no encontró evidencia suficiente de un comprobante o aviso de transferencia bancaria."
                    : "La IA analizó el mail y no encontró evidencia de un comprobante o aviso de transferencia bancaria.",
                details: this.normalizeString(extractionResult.reasoning),
            };
        }
        if (extractionResult.transfers.length === 0) {
            return {
                payloads: [],
                reason: "no-transfer-items",
                message: extractionResult.extractionSource === "FALLBACK"
                    ? "La IA no respondió y el fallback detectó señales de transferencia, pero no pudo extraer ningún comprobante procesable."
                    : "La IA detectó que el mail podría estar relacionado con transferencias, pero no pudo extraer ningún comprobante procesable.",
                details: this.normalizeString(extractionResult.reasoning),
            };
        }
        const processDate = new Date();
        const payloads = await Promise.all(extractionResult.transfers.map(async (extraction) => {
            const originName = this.normalizeString(extraction.originName);
            const emailFromName = this.normalizeString(extraction.affiliateName)
                || originName
                || inboundEmail.customer?.name
                || this.normalizeString(inboundEmail.fromName);
            const emailFromEmail = this.normalizeString(extraction.affiliateEmail)
                || inboundEmail.customer?.email
                || this.normalizeString(inboundEmail.fromEmail);
            const emailDocumentNumber = this.normalizeDocumentNumber(extraction.emailDocumentNumber
                || extraction.affiliateDocumentNumber
                || inboundEmail.customer?.documentNumber
                || this.extractDocumentNumberFromCuil(inboundEmail.customer?.cuil));
            const amount = typeof extraction.amount === "number" && Number.isFinite(extraction.amount)
                ? extraction.amount
                : undefined;
            const extractedAffiliates = this.normalizeAffiliates([
                {
                    name: extraction.affiliateName || originName,
                    email: extraction.affiliateEmail,
                    amount,
                    documentNumber: extraction.affiliateDocumentNumber,
                },
                ...(extraction.additionalAffiliates || []),
            ], amount);
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
                affiliates: extractedAffiliates,
                amount,
            });
            const aiStatus = extractionResult.extractionSource === "FALLBACK"
                ? "PROCESADO_SIN_IA"
                : this.resolveAiStatus({
                    amount,
                    transferDate,
                    affiliates: affiliateResolution.affiliates,
                    needsHumanReview: Boolean(extraction.needsHumanReview),
                });
            const aiProcessedAt = processDate;
            const payload = {
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
                operationNumber: this.normalizeOperationNumber(extraction.operationNumber),
                concept: this.normalizeString(extraction.concept),
                originName,
                originAccount,
                originCbu,
                originAlias: this.normalizeString(extraction.originAlias),
                originBank: this.normalizeString(extraction.originBank),
                destinationName: this.normalizeString(extraction.destinationName),
                destinationAccount: this.normalizeString(extraction.destinationAccount),
                destinationCbu: this.normalizeString(extraction.destinationCbu),
                destinationAlias: this.normalizeString(extraction.destinationAlias),
                destinationBank: this.normalizeString(extraction.destinationBank),
                affiliateStrategy: affiliateResolution.affiliateStrategy,
                payer: affiliateResolution.payer?._id,
                affiliates: affiliateResolution.affiliates,
                aiStatus,
                aiProcessedAt,
                aiError: extractionResult.aiError,
                humanStatus: "PENDIENTE",
                status: "PENDIENTE_AUDITORIA",
                needsHumanReview: this.resolveNeedsHumanReviewFromAiStatus(aiStatus),
                hasAdditionalInquiry: Boolean(extractionResult.hasAdditionalInquiry),
            };
            return this.removeUndefinedFields(payload);
        }));
        return { payloads };
    }
    async createTransferEmails(transferEmailPayloads) {
        const transferEmails = [];
        for (const transferEmailPayload of transferEmailPayloads) {
            transferEmails.push(await this.transferEmailService.create(transferEmailPayload));
        }
        return transferEmails;
    }
    buildManualTransferEmailPayload(inboundEmail, error) {
        const emailFromName = inboundEmail.customer?.name || this.normalizeString(inboundEmail.fromName);
        const emailFromEmail = inboundEmail.customer?.email || this.normalizeString(inboundEmail.fromEmail);
        const emailDocumentNumber = this.normalizeDocumentNumber(inboundEmail.customer?.documentNumber || this.extractDocumentNumberFromCuil(inboundEmail.customer?.cuil));
        return this.removeUndefinedFields({
            inboundEmail: inboundEmail._id,
            emailMessageId: inboundEmail.messageId,
            emailSubject: this.normalizeString(inboundEmail.subject),
            emailFromName,
            emailFromEmail,
            emailDocumentNumber,
            isTransferProof: true,
            emailDate: inboundEmail.receivedAt,
            processDate: new Date(),
            affiliateStrategy: EMAIL_DATA_AFFILIATE_STRATEGY,
            affiliates: this.ensureAffiliates([], {
                name: emailFromName,
                documentNumber: emailDocumentNumber,
            }),
            aiStatus: "ERROR_PROCESAMIENTO",
            aiProcessedAt: new Date(),
            aiError: error ? this.serializeErrorMessage(error) : undefined,
            humanStatus: "PENDIENTE",
            status: "PENDIENTE_AUDITORIA",
            needsHumanReview: true,
            hasAdditionalInquiry: false,
        });
    }
    async resolveAffiliateFromPayerMappings(input) {
        const criteria = this.buildPayerLookupCriteria(input);
        const payers = await this.payerService.findByAnyStrategy(criteria);
        const payerMatch = this.findFirstPayerMatchByStrategyPriority(criteria, payers);
        if (payerMatch) {
            return {
                affiliateStrategy: payerMatch.strategy,
                affiliates: this.resolveAffiliatesFromPayer(payerMatch.payer, input.affiliates, input.amount, {
                    name: input.emailFromName,
                    documentNumber: input.emailDocumentNumber,
                }),
                payerFound: true,
                payer: payerMatch.payer,
                payerStrategy: payerMatch.strategy,
            };
        }
        return {
            affiliateStrategy: EMAIL_DATA_AFFILIATE_STRATEGY,
            affiliates: this.ensureAffiliates(input.affiliates, {
                name: input.emailFromName,
                documentNumber: input.emailDocumentNumber,
                amount: input.amount,
            }, input.amount),
            payerFound: false,
            payer: null,
        };
    }
    isMissingCriticalTransferData(transferEmail, affiliates) {
        return !transferEmail.amount
            || !affiliates?.some((affiliate) => Boolean(affiliate.documentNumber))
            || !transferEmail.transferDate;
    }
    hasAffiliateResolutionChanged(transferEmail, updatePayload) {
        return transferEmail.affiliateStrategy !== updatePayload.affiliateStrategy
            || this.resolvePayerId(transferEmail.payer) !== this.resolvePayerId(updatePayload.payer)
            || JSON.stringify(this.normalizeAffiliates(transferEmail.affiliates)) !== JSON.stringify(this.normalizeAffiliates(updatePayload.affiliates));
    }
    buildReprocessChanges(transferEmail, updatePayload) {
        return [
            this.buildReprocessChange("affiliateStrategy", "Estrategia", transferEmail.affiliateStrategy, updatePayload.affiliateStrategy),
            this.buildReprocessChange("payer", "Payer", this.formatPayer(transferEmail.payer), this.formatPayer(updatePayload.payer)),
            this.buildReprocessChange("affiliates", "Afiliados", this.formatAffiliates(transferEmail.affiliates), this.formatAffiliates(updatePayload.affiliates)),
        ].filter((change) => Boolean(change));
    }
    buildReprocessChange(field, label, before, after) {
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
    formatAffiliates(affiliates) {
        const formatted = (affiliates || [])
            .map((affiliate) => [
            affiliate.name,
            affiliate.amount,
            affiliate.documentNumber,
            affiliate.month,
            affiliate.observations,
        ].filter(Boolean).join(" / "))
            .filter(Boolean);
        return formatted.length > 0 ? formatted.join("; ") : "";
    }
    formatReprocessValue(value) {
        return value || "-";
    }
    resolvePayerId(payer) {
        if (!payer) {
            return "";
        }
        if (typeof payer === "string") {
            return payer;
        }
        return payer._id?.toString?.() || payer._id || "";
    }
    formatPayer(payer) {
        if (!payer) {
            return "";
        }
        if (typeof payer === "string") {
            return payer;
        }
        return [payer.strategy, payer.value].filter(Boolean).join(" / ") || this.resolvePayerId(payer);
    }
    resolveAffiliatesFromPayer(payer, fallbackAffiliates, totalAmount, fallbackPrimary) {
        const payerAffiliates = this.normalizeAffiliates(payer.affiliates);
        const normalizedFallbackAffiliates = this.normalizeAffiliates(fallbackAffiliates, totalAmount);
        if (payerAffiliates.length > 0) {
            return payerAffiliates.map((affiliate, index) => ({
                ...affiliate,
                amount: this.resolveAffiliateAmount(affiliate.amount, totalAmount, payerAffiliates.length, index),
                month: this.findMatchingAffiliateMetadata(affiliate, normalizedFallbackAffiliates, index)?.month,
                observations: this.findMatchingAffiliateMetadata(affiliate, normalizedFallbackAffiliates, index)?.observations,
            }));
        }
        return this.ensureAffiliates(normalizedFallbackAffiliates, fallbackPrimary ? { ...fallbackPrimary, amount: totalAmount } : undefined, totalAmount);
    }
    findMatchingAffiliateMetadata(affiliate, fallbackAffiliates = [], index = 0) {
        return fallbackAffiliates.find((fallbackAffiliate) => Boolean(affiliate.documentNumber && fallbackAffiliate.documentNumber === affiliate.documentNumber
            || affiliate.name && fallbackAffiliate.name === affiliate.name)) || fallbackAffiliates[index];
    }
    buildPayerLookupCriteria(input) {
        return [
            this.buildPayerLookupCriterion("EMAIL_FROM", input.emailFromEmail),
            this.buildPayerLookupCriterion("DNI_CUIL", input.emailDocumentNumber),
            this.buildPayerLookupCriterion("CBU_CVU", input.originCbu),
            this.buildPayerLookupCriterion("NRO_CUENTA", input.originAccount),
        ].filter((criterion) => Boolean(criterion));
    }
    buildPayerLookupCriterion(strategy, value) {
        const normalizedValue = this.normalizeString(value);
        return normalizedValue ? { strategy, value: normalizedValue } : undefined;
    }
    findFirstPayerMatchByStrategyPriority(criteria, payers) {
        for (const criterion of criteria) {
            const payer = payers.find((item) => item.strategy === criterion.strategy
                && this.normalizeString(item.value) === criterion.value);
            if (payer) {
                return { strategy: criterion.strategy, payer };
            }
        }
        return undefined;
    }
    resolveAiStatus(input) {
        if (!input.amount || !input.affiliates?.some((affiliate) => Boolean(affiliate.documentNumber)) || !input.transferDate) {
            return "PROCESADO_INCOMPLETO";
        }
        if (input.needsHumanReview) {
            return "PROCESADO_CON_DUDAS";
        }
        return "PROCESADO_CONFIABLE";
    }
    resolveNeedsHumanReviewFromAiStatus(aiStatus) {
        return aiStatus === "PROCESADO_CON_DUDAS"
            || aiStatus === "PROCESADO_INCOMPLETO"
            || aiStatus === "PROCESADO_SIN_IA"
            || aiStatus === "ERROR_PROCESAMIENTO";
    }
    resolvePendingAuditStatus(currentStatus) {
        return currentStatus === "AUDITADO"
            ? "AUDITADO"
            : "PENDIENTE_AUDITORIA";
    }
    async markTransferEmailAiError(transferEmail, error) {
        try {
            await this.transferEmailService.updatePartial(transferEmail._id, {
                aiStatus: "ERROR_PROCESAMIENTO",
                aiProcessedAt: new Date(),
                aiError: this.serializeErrorMessage(error),
                status: this.resolvePendingAuditStatus(transferEmail.status),
                needsHumanReview: true,
            });
        }
        catch (updateError) {
            this.logError("Error updating transfer email AI error state", updateError, {
                transferEmailId: transferEmail._id,
            });
        }
    }
    async extractTransferData(inboundEmail) {
        try {
            return {
                ...await this.extractTransferDataWithAi(inboundEmail),
                extractionSource: "AI",
            };
        }
        catch (error) {
            return extractTransferEmailFallback(inboundEmail, this.serializeErrorMessage(error));
        }
    }
    async extractTransferDataWithAi(inboundEmail) {
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
                    "originName es el nombre del titular, ordenante, remitente o pagador de la cuenta bancaria de origen cuando aparezca en el comprobante.",
                    "destinationName es el nombre del titular o beneficiario de la cuenta bancaria de destino cuando aparezca en el comprobante.",
                    "originAccount y destinationAccount son numeros o identificadores de cuenta; no pongas nombres de personas en esos campos.",
                    "affiliateName, affiliateEmail y affiliateDocumentNumber deben contener datos del remitente o pagador cuando aparezcan en el mail; el afiliado final se resuelve luego con mapeos de pagadores.",
                    "additionalAffiliates debe incluir otros afiliados pagados por la misma transferencia, con name, email y documentNumber cuando aparezcan.",
                    "hasAdditionalInquiry debe ser true si el asunto o cuerpo del mail incluye una consulta, reclamo, pedido, problema o solicitud de respuesta adicional al envio del comprobante.",
                    "hasAdditionalInquiry debe ser false cuando el mail solo informa o adjunta el comprobante, agradece, saluda, o contiene frases operativas simples como 'envio comprobante', 'adjunto pago' o 'realice transferencia'.",
                    "Ejemplos para hasAdditionalInquiry=true: pregunta por deuda, cobertura, autorizacion, factura, baja, reintegro, estado de cuenta, error en imputacion, reclamo por cobro, pedido de contacto o cualquier texto que requiera contestacion humana.",
                    "Usa exclusivamente la evidencia disponible en asunto, cuerpo, texto normalizado, OCR de adjuntos y metadatos del remitente.",
                    "No inventes ni completes campos por inferencia débil.",
                    "Si un dato no está claro o no aparece, devuélvelo como null.",
                    "operationNumber solo debe completarse si aparece explicitamente como numero, id, codigo o referencia de operacion/comprobante.",
                    "Nunca uses una fecha, una hora o una combinacion de fecha y hora como operationNumber.",
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
        }
        catch (error) {
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
    normalizeOperationNumber(value) {
        const normalized = this.normalizeString(value);
        if (!normalized) {
            return undefined;
        }
        if (!/\d/.test(normalized)) {
            return undefined;
        }
        if (this.looksLikeDateTimeValue(normalized)) {
            return undefined;
        }
        return normalized;
    }
    looksLikeDateTimeValue(value) {
        const normalized = value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\b(a|p)\.\s*m\.\b/g, "")
            .replace(/hs\b/g, "")
            .replace(/\s+/g, " ")
            .trim();
        return /^(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})(?:\s*[,-]?\s*\d{1,2}:\d{2}(?::\d{2})?)?$/.test(normalized);
    }
    extractDocumentNumberFromCuil(value) {
        const digits = value?.replace(/\D/g, "");
        if (digits && digits.length === 11) {
            return digits.slice(2, 10);
        }
        return undefined;
    }
    normalizeAffiliates(affiliates, totalAmount) {
        const normalized = (affiliates || [])
            .map((affiliate) => this.removeUndefinedFields({
            name: this.normalizeString(affiliate.name),
            amount: typeof affiliate.amount === "number" && Number.isFinite(affiliate.amount) ? affiliate.amount : undefined,
            documentNumber: this.normalizeDocumentNumber(affiliate.documentNumber),
            month: this.normalizeString(affiliate.month),
            observations: this.normalizeString(affiliate.observations),
        }))
            .filter((affiliate) => affiliate.name || affiliate.documentNumber || affiliate.amount !== undefined || affiliate.month || affiliate.observations);
        if (normalized.length === 1 && normalized[0].amount === undefined && totalAmount !== undefined) {
            normalized[0].amount = totalAmount;
        }
        return normalized;
    }
    ensureAffiliates(affiliates, fallbackAffiliate, totalAmount) {
        const normalizedAffiliates = this.normalizeAffiliates(affiliates, totalAmount);
        if (normalizedAffiliates.length > 0) {
            return normalizedAffiliates;
        }
        if (!fallbackAffiliate) {
            return normalizedAffiliates;
        }
        return this.normalizeAffiliates([fallbackAffiliate], totalAmount);
    }
    resolveAffiliateAmount(currentAmount, totalAmount, affiliatesCount, index) {
        if (currentAmount !== undefined) {
            return currentAmount;
        }
        if (totalAmount === undefined) {
            return undefined;
        }
        if (affiliatesCount === 1) {
            return totalAmount;
        }
        if (affiliatesCount <= 0) {
            return undefined;
        }
        const evenAmount = Number((totalAmount / affiliatesCount).toFixed(2));
        if (index < affiliatesCount - 1) {
            return evenAmount;
        }
        return Number((totalAmount - evenAmount * (affiliatesCount - 1)).toFixed(2));
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
            return this.normalizeSettingBoolean(setting?.value);
        }
        catch (error) {
            this.logError("Error reading inbound transfer automation setting", error, { settingKey: key });
            return false;
        }
    }
    async getTransferEmailCategoryFilter() {
        try {
            const setting = await SettingServiceFactory().findByKey(INBOUND_MAIL_TRANSFER_CATEGORY_SETTING_KEY);
            const categories = this.normalizeSettingStringList(setting?.value);
            if (categories.length === 0) {
                return null;
            }
            return categories.length === 1 ? categories[0] : categories;
        }
        catch (error) {
            this.logError("Error reading inbound transfer category setting", error, {
                settingKey: INBOUND_MAIL_TRANSFER_CATEGORY_SETTING_KEY,
            });
            return null;
        }
    }
    normalizeSettingBoolean(value) {
        if (typeof value === "boolean") {
            return value;
        }
        return typeof value === "string" && value.trim().toLowerCase() === "true";
    }
    normalizeSettingStringList(value) {
        const values = Array.isArray(value) ? value : this.parseSettingStringListValue(value);
        return values
            .filter((item) => typeof item === "string")
            .flatMap((item) => item.split(","))
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }
    parseSettingStringListValue(value) {
        if (typeof value !== "string") {
            return [];
        }
        const trimmedValue = value.trim();
        if (!trimmedValue) {
            return [];
        }
        if (trimmedValue.startsWith("[")) {
            try {
                const parsedValue = JSON.parse(trimmedValue);
                if (Array.isArray(parsedValue)) {
                    return parsedValue;
                }
            }
            catch {
                return [trimmedValue];
            }
        }
        return [trimmedValue];
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
    serializeErrorMessage(error) {
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
        }
        catch {
            return "Unknown error";
        }
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
