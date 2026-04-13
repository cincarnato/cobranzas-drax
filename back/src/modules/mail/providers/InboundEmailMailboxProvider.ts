import {Readable} from "node:stream";
import {extname} from "node:path";
import {z} from "zod";
import type {IAIProvider} from "@drax/ai-back";
import {OpenAiProviderFactory} from "@drax/ai-back";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";
import type InboundEmailService from "../services/InboundEmailService.js";
import type MailboxService from "../services/MailboxService.js";
import type {IMailbox} from "../interfaces/IMailbox.js";
import type {IInboundEmail, IInboundEmailBase} from "../interfaces/IInboundEmail.js";
import AffiliateServiceFactory from "../../premedic/factory/services/AffiliateServiceFactory.js";
import type AffiliateService from "../../premedic/services/AffiliateService.js";
import {MediaService} from "@drax/media-back";
import {ImapFlow} from "imapflow";
import {extractTextWithTesseract} from "../tools/TesseractOCR.js";
import {extractTextFromPdf} from "../tools/PdfTextExtractor.js";


type ParsedAddress = {
    name?: string;
    address?: string;
};

type ParsedAttachment = {
    filename?: string;
    contentType?: string;
    size?: number;
    content?: Buffer;
};

type ParsedMailLike = {
    messageId?: string;
    subject?: string;
    date?: Date;
    text?: string;
    html?: string | false;
    from?: { value?: ParsedAddress[] };
    to?: { value?: ParsedAddress[] };
    cc?: { value?: ParsedAddress[] };
    replyTo?: { value?: ParsedAddress[] };
    inReplyTo?: string | string[];
    references?: string | string[];
    attachments?: ParsedAttachment[];
};

type ImapFetchMessage = {
    uid: number;
    internalDate?: Date;
    raw: Buffer;
};

type SyncMailboxResult = {
    mailboxId: string;
    fetched: number;
    created: number;
    skipped: number;
    errors: string[];
};

type SyncAllResult = {
    processedMailboxes: number;
    createdEmails: number;
    fetchedEmails: number;
    skippedEmails: number;
    errors: Array<{ mailboxId: string; error: string }>;
};

type AttachmentProcessingResult = {
    storedAttachments: NonNullable<IInboundEmailBase["attachments"]>;
    ocrText?: string;
};

type AnalysisResult = {
    category?: string;
    sentiment?: string;
    priority?: string;
    summary?: string;
    tags: string[];
    aiModel: string;
    customer: NonNullable<IInboundEmailBase["customer"]>;
    extractedEntities: NonNullable<IInboundEmailBase["extractedEntities"]>;
    processingStatus: string;
    reviewStatus: string;
};

type ErrorContext = Record<string, unknown>;

const inboundEmailAiSchema = z.object({
    category: z.string().nullable(),
    sentiment: z.string().nullable(),
    priority: z.string().nullable(),
    summary: z.string().nullable(),
    tags: z.array(z.string()).nullable(),
    customer: z.object({
        name: z.string().nullable(),
        documentNumber: z.string().nullable(),
        cuil: z.string().nullable(),
        email: z.string().nullable(),
        phone: z.string().nullable(),
    }).nullable(),
    extractedEntities: z.array(z.object({
        label: z.string(),
        value: z.string().nullable(),
        source: z.string().nullable(),
        confidence: z.number().nullable(),
    })).nullable(),
    needsHumanReview: z.boolean().nullable(),
});

type InboundEmailAiExtraction = z.infer<typeof inboundEmailAiSchema>;

const DEFAULT_POLL_INTERVAL_MS = 60_000;
const DEFAULT_FETCH_LIMIT = 25;
const DEFAULT_LOOKBACK_DAYS = 10;

class InboundEmailMailboxProvider {
    private static singleton: InboundEmailMailboxProvider;
    private mailboxService: MailboxService;
    private inboundEmailService: InboundEmailService;
    private affiliateService: AffiliateService;
    private mediaService: MediaService;
    private openAiProvider: IAIProvider;
    private pollTimer?: NodeJS.Timeout;
    private syncInProgress = false;
    private readonly mailboxRunState = new Map<string, { running: boolean; lastRunAt?: number }>();
    private readonly pollIntervalMs: number;
    private readonly fetchLimit: number;

    constructor() {
        this.mailboxService = MailboxServiceFactory.instance;
        this.inboundEmailService = InboundEmailServiceFactory.instance;
        this.affiliateService = AffiliateServiceFactory.instance;
        this.mediaService = new MediaService();
        this.openAiProvider = OpenAiProviderFactory.instance();
        this.pollIntervalMs = this.readNumberEnv("INBOUND_EMAIL_POLL_INTERVAL_MS", DEFAULT_POLL_INTERVAL_MS);
        this.fetchLimit = this.readNumberEnv("INBOUND_EMAIL_FETCH_LIMIT", DEFAULT_FETCH_LIMIT);
    }

    static get instance(): InboundEmailMailboxProvider {
        if (!InboundEmailMailboxProvider.singleton) {
            InboundEmailMailboxProvider.singleton = new InboundEmailMailboxProvider();
        }

        return InboundEmailMailboxProvider.singleton;
    }

    start(): void {
        if (this.pollTimer) {
            return;
        }

        void this.syncAllEnabledMailboxes();
        this.pollTimer = setInterval(() => {
            void this.syncAllEnabledMailboxes();
        }, this.pollIntervalMs);
    }

    stop(): void {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = undefined;
        }
    }

    async syncAllEnabledMailboxes(): Promise<SyncAllResult> {
        if (this.syncInProgress) {
            return {
                processedMailboxes: 0,
                createdEmails: 0,
                fetchedEmails: 0,
                skippedEmails: 0,
                errors: [],
            };
        }

        this.syncInProgress = true;

        try {
            const mailboxes = await this.mailboxService.find({
                limit: 0,
                filters: [
                    {field: "isActive", operator: "eq", value: true},
                    {field: "autoProcessEnabled", operator: "eq", value: true},
                    {field: "imapEnabled", operator: "eq", value: true},
                    {field: "processingProtocol", operator: "eq", value: "IMAP"},
                ],
            });

            const result: SyncAllResult = {
                processedMailboxes: 0,
                createdEmails: 0,
                fetchedEmails: 0,
                skippedEmails: 0,
                errors: [],
            };

            for (const mailbox of mailboxes) {
                if (!this.shouldRunMailbox(mailbox)) {
                    continue;
                }

                const mailboxState = this.mailboxRunState.get(mailbox._id) || {running: false};
                mailboxState.running = true;
                this.mailboxRunState.set(mailbox._id, mailboxState);

                try {
                    const syncResult = await this.syncMailbox(mailbox);
                    result.processedMailboxes += 1;
                    result.createdEmails += syncResult.created;
                    result.fetchedEmails += syncResult.fetched;
                    result.skippedEmails += syncResult.skipped;

                    for (const error of syncResult.errors) {
                        result.errors.push({mailboxId: mailbox._id, error});
                    }
                } catch (error: any) {
                    this.logError("Error syncing mailbox", error, {
                        mailboxId: mailbox._id,
                        mailboxName: mailbox.name,
                        mailboxEmail: mailbox.email,
                    });
                    result.errors.push({
                        mailboxId: mailbox._id,
                        error: this.formatError(error),
                    });
                } finally {
                    this.mailboxRunState.set(mailbox._id, {
                        running: false,
                        lastRunAt: Date.now(),
                    });
                }
            }

            return result;
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncMailbox(mailbox: IMailbox): Promise<SyncMailboxResult> {
        const result: SyncMailboxResult = {
            mailboxId: mailbox._id,
            fetched: 0,
            created: 0,
            skipped: 0,
            errors: [],
        };

        const client = new ImapFlow({
            host: mailbox.imapHost || "",
            port: mailbox.imapPort || 993,
            secure: mailbox.imapTls !== false,
            auth: {
                user: mailbox.username,
                pass: mailbox.password,
            },
            disableAutoIdle: true,
            logger: false,
            tls: {
                rejectUnauthorized: process.env.IMAP_REJECT_UNAUTHORIZED !== "false",
            },
        });

        try {
            await client.connect();
            await client.mailboxOpen("INBOX");

            const searchQuery = await this.buildSearchQuery(mailbox._id);
            const allUids = await client.search(searchQuery, {uid: true});
            const uids = (allUids || []).slice(-this.fetchLimit);

            for (const uid of uids) {
                result.fetched += 1;

                try {
                    const fetched = await client.fetchOne(
                        uid,
                        {uid: true, internalDate: true, source: true},
                        {uid: true}
                    );
                    const fetchMessage: ImapFetchMessage | null = fetched && fetched.source?.length
                        ? {
                            uid: fetched.uid || uid,
                            internalDate: fetched.internalDate ? new Date(fetched.internalDate) : undefined,
                            raw: fetched.source,
                        }
                        : null;

                    if (!fetchMessage?.raw?.length) {
                        result.skipped += 1;
                        continue;
                    }

                    const parsedMail = await this.parseEmail(fetchMessage.raw);
                    const messageId = this.resolveMessageId(parsedMail, mailbox, uid);
                    const duplicate = await this.findExistingByMessageId(messageId);

                    if (duplicate) {
                        result.skipped += 1;
                        continue;
                    }

                    const inboundEmail = await this.buildInboundEmail(mailbox, parsedMail, fetchMessage, messageId);
                    await this.inboundEmailService.create(inboundEmail);
                    result.created += 1;
                } catch (error: any) {
                    this.logError("Error processing inbound email", error, {
                        mailboxId: mailbox._id,
                        mailboxName: mailbox.name,
                        mailboxEmail: mailbox.email,
                        uid,
                    });
                    result.errors.push(this.formatError(error));
                }
            }
        } finally {
            await client.logout().catch(() => undefined);
        }

        return result;
    }

    private shouldRunMailbox(mailbox: IMailbox): boolean {
        const state = this.mailboxRunState.get(mailbox._id);
        if (state?.running) {
            return false;
        }

        const intervalMinutes = mailbox.processingIntervalMinutes || 5;
        if (!state?.lastRunAt) {
            return true;
        }

        return Date.now() - state.lastRunAt >= intervalMinutes * 60_000;
    }

    private async buildSearchQuery(mailboxId: string): Promise<{ since: Date }> {
        const latestEmail = await this.findLatestInboundByMailbox(mailboxId);
        if (!latestEmail?.receivedAt) {
            return {
                since: new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000),
            };
        }

        return {
            since: new Date(new Date(latestEmail.receivedAt).getTime() - 24 * 60 * 60 * 1000),
        };
    }

    private async findLatestInboundByMailbox(mailboxId: string): Promise<IInboundEmail | null> {
        const latest = await this.inboundEmailService.paginate({
            page: 1,
            limit: 1,
            orderBy: "receivedAt",
            order: "desc",
            filters: [{field: "mailbox", operator: "eq", value: mailboxId}],
        });

        return latest.items[0] || null;
    }

    private async findExistingByMessageId(messageId: string): Promise<IInboundEmail | null> {
        return await this.inboundEmailService.findOne({
            filters: [{field: "messageId", operator: "eq", value: messageId}],
        });
    }

    private async buildInboundEmail(
        mailbox: IMailbox,
        parsedMail: ParsedMailLike,
        fetchMessage: ImapFetchMessage,
        messageId: string
    ): Promise<IInboundEmailBase> {
        const textBody = this.normalizeText(parsedMail.text || "");
        const htmlBody = typeof parsedMail.html === "string" ? parsedMail.html : undefined;
        const from = parsedMail.from?.value?.[0];
        const replyTo = parsedMail.replyTo?.value?.[0];
        const parsedAttachments = parsedMail.attachments || [];
        const attachmentResult = await this.processAttachments(mailbox, messageId, parsedAttachments);
        const analysisBodyText = this.normalizeText([textBody, attachmentResult.ocrText].filter(Boolean).join("\n\n"));
        const normalizedText = this.normalizeText([parsedMail.subject, analysisBodyText].filter(Boolean).join("\n\n"));
        const analysis = await this.analyzeInboundEmail({
            mailbox,
            messageId,
            subject: parsedMail.subject,
            bodyText: analysisBodyText,
            normalizedText,
            attachmentsOcrText: attachmentResult.ocrText,
            fromEmail: from?.address,
            fromName: from?.name,
        });

        return {
            messageId,
            threadId: this.resolveThreadId(parsedMail),
            mailbox: mailbox._id,
            sourceChannel: "EMAIL",
            receivedAt: parsedMail.date || fetchMessage.internalDate || new Date(),
            subject: parsedMail.subject,
            fromName: from?.name,
            fromEmail: from?.address,
            toEmails: this.extractAddresses(parsedMail.to?.value),
            ccEmails: this.extractAddresses(parsedMail.cc?.value),
            replyToEmail: replyTo?.address,
            bodyText: textBody,
            bodyHtml: htmlBody,
            normalizedText,
            hasAttachments: parsedAttachments.length > 0,
            attachmentCount: parsedAttachments.length,
            attachments: attachmentResult.storedAttachments,
            attachmentsOcrText: attachmentResult.ocrText,
            category: analysis.category,
            sentiment: analysis.sentiment,
            priority: analysis.priority,
            summary: analysis.summary,
            tags: analysis.tags,
            aiModel: analysis.aiModel,
            customer: analysis.customer,
            extractedEntities: analysis.extractedEntities,
            processingStatus: analysis.processingStatus,
            reviewStatus: analysis.reviewStatus,
            isDuplicate: false,
            processedAt: new Date(),
        };
    }

    private async parseEmail(raw: Buffer): Promise<ParsedMailLike> {
        try {
            const mailparser = await import("mailparser");
            const parsed = await mailparser.simpleParser(raw);
            return parsed as ParsedMailLike;
        } catch {
            return this.parseEmailFallback(raw);
        }
    }

    private parseEmailFallback(raw: Buffer): ParsedMailLike {
        const content = raw.toString("utf8");
        const separator = /\r?\n\r?\n/;
        const [headersPart, ...bodyParts] = content.split(separator);
        const body = bodyParts.join("\n\n");
        const headers = this.parseHeaders(headersPart || "");
        const from = this.parseAddressHeader(headers["from"]);
        const to = this.parseAddressHeader(headers["to"]);
        const cc = this.parseAddressHeader(headers["cc"]);
        const replyTo = this.parseAddressHeader(headers["reply-to"]);
        const dateHeader = headers["date"] ? new Date(headers["date"]) : undefined;

        return {
            messageId: headers["message-id"],
            subject: headers["subject"],
            date: dateHeader && !Number.isNaN(dateHeader.getTime()) ? dateHeader : undefined,
            text: body,
            html: undefined,
            from: {value: from ? [from] : []},
            to: {value: to ? [to] : []},
            cc: {value: cc ? [cc] : []},
            replyTo: {value: replyTo ? [replyTo] : []},
            inReplyTo: headers["in-reply-to"],
            references: headers["references"],
            attachments: [],
        };
    }

    private parseHeaders(rawHeaders: string): Record<string, string> {
        const lines = rawHeaders.split(/\r?\n/);
        const headers: Record<string, string> = {};
        let currentHeader = "";

        for (const line of lines) {
            if (/^\s/.test(line) && currentHeader) {
                headers[currentHeader] = `${headers[currentHeader]} ${line.trim()}`.trim();
                continue;
            }

            const separatorIndex = line.indexOf(":");
            if (separatorIndex < 0) {
                continue;
            }

            currentHeader = line.slice(0, separatorIndex).toLowerCase();
            headers[currentHeader] = line.slice(separatorIndex + 1).trim();
        }

        return headers;
    }

    private parseAddressHeader(rawHeader?: string): ParsedAddress | undefined {
        if (!rawHeader) {
            return undefined;
        }

        const match = rawHeader.match(/^(.*?)<([^>]+)>$/);
        if (match) {
            return {
                name: match[1].replace(/(^"|"$)/g, "").trim(),
                address: match[2].trim(),
            };
        }

        if (rawHeader.includes("@")) {
            return {address: rawHeader.trim()};
        }

        return {name: rawHeader.trim()};
    }

    private resolveMessageId(parsedMail: ParsedMailLike, mailbox: IMailbox, uid: number): string {
        const rawMessageId = parsedMail.messageId?.trim();
        if (rawMessageId) {
            return rawMessageId.replace(/\s+/g, "");
        }

        return `<${mailbox._id}-${uid}@inbound-email.local>`;
    }

    private resolveThreadId(parsedMail: ParsedMailLike): string | undefined {
        const references = Array.isArray(parsedMail.references)
            ? parsedMail.references[0]
            : parsedMail.references;

        if (references) {
            return references;
        }

        if (Array.isArray(parsedMail.inReplyTo)) {
            return parsedMail.inReplyTo[0];
        }

        return parsedMail.inReplyTo;
    }

    private extractAddresses(addresses?: ParsedAddress[]): string[] {
        return (addresses || [])
            .map((item) => item.address?.trim())
            .filter((item): item is string => Boolean(item));
    }

    private async processAttachments(
        mailbox: IMailbox,
        messageId: string,
        attachments: ParsedAttachment[]
    ): Promise<AttachmentProcessingResult> {
        const result: AttachmentProcessingResult = {
            storedAttachments: [],
        };

        if (!attachments.length) {
            return result;
        }

        if (mailbox.attachmentStorageEnabled !== false) {
            result.storedAttachments = await this.saveAttachments(mailbox, messageId, attachments);
        }

        if (mailbox.attachmentOcrEnabled) {
            result.ocrText = await this.extractAttachmentsOcrText(attachments);
        }

        return result;
    }

    private async saveAttachments(mailbox: IMailbox, messageId: string, attachments: ParsedAttachment[]) {
        if (!attachments.length) {
            return [];
        }

        const storedAttachments: NonNullable<IInboundEmailBase["attachments"]> = [];
        const dir = this.buildAttachmentDir(mailbox, messageId);

        for (const attachment of attachments) {
            if (!attachment.content?.length) {
                continue;
            }

            const filename = this.sanitizeFilename(attachment.filename || `attachment-${storedAttachments.length + 1}.bin`);
            const savedFile = await this.mediaService.saveFile({
                dir,
                file: {
                    filename,
                    fileStream: Readable.from(attachment.content),
                    mimetype: attachment.contentType || "application/octet-stream",
                    encoding: "binary",
                    size: attachment.size || attachment.content.length,
                },
                createdBy: {
                    id: mailbox._id,
                    username: mailbox.username,
                },
            });

            storedAttachments.push({
                filename: savedFile.filename,
                filepath: savedFile.relativePath,
                size: savedFile.size,
                mimetype: savedFile.mimetype || attachment.contentType,
                url: savedFile.url,
            });
        }

        return storedAttachments;
    }

    private async extractAttachmentsOcrText(attachments: ParsedAttachment[]): Promise<string | undefined> {
        const chunks: string[] = [];

        for (const attachment of attachments) {
            if (!attachment.content?.length) {
                continue;
            }

            try {
                const text = await this.extractTextFromAttachment(attachment);
                if (!text) {
                    continue;
                }

                const filename = attachment.filename || `attachment-${chunks.length + 1}`;
                chunks.push(`Archivo: ${filename}\n${text}`);
            } catch {
                continue;
            }
        }

        const result = this.normalizeText(chunks.join("\n\n"));
        return result || undefined;
    }

    private async extractTextFromAttachment(attachment: ParsedAttachment): Promise<string> {
        const filename = attachment.filename || "";
        const extension = extname(filename).toLowerCase();
        const mimetype = (attachment.contentType || "").toLowerCase();

        if (this.isPdfAttachment(mimetype, extension)) {
            return this.normalizeText(await extractTextFromPdf(attachment.content || Buffer.alloc(0)));
        }

        if (this.isImageAttachment(mimetype, extension)) {
            return this.normalizeText(await extractTextWithTesseract(attachment.content || Buffer.alloc(0), extension));
        }

        return "";
    }

    private isPdfAttachment(mimetype: string, extension: string): boolean {
        return mimetype === "application/pdf" || extension === ".pdf";
    }

    private isImageAttachment(mimetype: string, extension: string): boolean {
        if (mimetype.startsWith("image/")) {
            return true;
        }

        return [".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".gif", ".webp"].includes(extension);
    }

    private buildAttachmentDir(mailbox: IMailbox, messageId: string): string {
        const mailboxSegment = this.sanitizePathSegment(mailbox._id).slice(0, 20) || "mailbox";
        const messageSegment = this.sanitizePathSegment(messageId.replace(/[<>]/g, "")).slice(0, 20) || "message";
        return this.sanitizePathSegment(`inbound_${mailboxSegment}_${messageSegment}`);
    }

    private async analyzeInboundEmail(input: {
        mailbox: IMailbox;
        messageId: string;
        subject?: string;
        bodyText?: string;
        normalizedText: string;
        attachmentsOcrText?: string;
        fromEmail?: string;
        fromName?: string;
    }): Promise<AnalysisResult> {
        const extraction = await this.extractInboundEmailDataWithAi(input);
        const tags = await this.syncMailboxTags(input.mailbox, extraction.tags || []);
        const extractedEntities = this.sanitizeExtractedEntities(extraction.extractedEntities || []);
        const customer = {
            name: this.normalizeString(extraction.customer?.name) || input.fromName,
            documentNumber: this.normalizeDigits(extraction.customer?.documentNumber),
            cuil: this.normalizeDigits(extraction.customer?.cuil),
            email: this.normalizeString(extraction.customer?.email)?.toLowerCase() || input.fromEmail,
            phone: this.normalizePhone(extraction.customer?.phone),
        };
        const matchedAffiliateId = await this.findAffiliateId(customer);
        const needsHumanReview = extraction.needsHumanReview ?? Boolean(
            !matchedAffiliateId && !customer.documentNumber && !customer.cuil
        );

        return {
            category: this.normalizeString(extraction.category),
            sentiment: this.normalizeString(extraction.sentiment),
            priority: this.normalizeString(extraction.priority),
            summary: this.normalizeString(extraction.summary),
            tags,
            aiModel: this.resolveAiModelName(),
            customer,
            extractedEntities,
            processingStatus: needsHumanReview ? "REVIEW_REQUIRED" : "PROCESSED",
            reviewStatus: needsHumanReview ? "PENDING" : "APPROVED",
        };
    }

    private async extractInboundEmailDataWithAi(input: {
        mailbox: IMailbox;
        messageId: string;
        subject?: string;
        bodyText?: string;
        normalizedText: string;
        attachmentsOcrText?: string;
        fromEmail?: string;
        fromName?: string;
    }): Promise<InboundEmailAiExtraction> {
        const mailboxCategories = (input.mailbox.categories || []).map((category) => ({
            name: category.name,
            description: category.description,
        }));
        const mailboxEntities = (input.mailbox.entities || []).map((entity) => ({
            name: entity.name,
            description: entity.description,
        }));

        const response = await this.openAiProvider.prompt({
            systemPrompt: [
                "Sos un analista de correos entrantes para un sistema de cobranzas y salud.",
                "Todo el analisis debe basarse exclusivamente en la evidencia disponible en asunto, cuerpo, texto normalizado, OCR de adjuntos y metadatos del remitente.",
                "No inventes datos ni completes campos con inferencias debiles.",
                "Mailbox define las opciones posibles de category, sentiment, priority, tags y entities.",
                "Debes responder usando texto libre, pero cuando mailbox defina opciones para category, sentiment o priority debes elegir una de esas opciones exactas.",
                "Para tags puedes usar tags del mailbox y tambien proponer nuevos tags si realmente hacen falta.",
                "Para extractedEntities usa labels de entities del mailbox cuando existan.",
                "Si un valor no se puede determinar con confianza suficiente, devuelve null.",
                "needsHumanReview debe ser true cuando haya ambiguedad relevante o falten datos clave para operar el correo.",
                "source en extractedEntities debe ser uno de SUBJECT, BODY, ATTACHMENT o MANUAL.",
            ].join("\n"),
            userInput: this.buildAiUserInput(input, mailboxCategories, mailboxEntities),
            zodSchema: inboundEmailAiSchema,
        });

        return this.parseAiOutput(response.output);
    }

    private buildAiUserInput(
        input: {
            mailbox: IMailbox;
            messageId: string;
            subject?: string;
            bodyText?: string;
            normalizedText: string;
            attachmentsOcrText?: string;
            fromEmail?: string;
            fromName?: string;
        },
        mailboxCategories: Array<{ name: string; description?: string }>,
        mailboxEntities: Array<{ name: string; description?: string }>
    ): string {
        const sections = [
            this.buildSection("MAILBOX CONFIG", [
                `mailboxId: ${input.mailbox._id}`,
                `mailboxName: ${input.mailbox.name}`,
                `mailboxEmail: ${input.mailbox.email}`,
                `categories: ${this.formatOptionObjects(mailboxCategories)}`,
                `sentiments: ${this.formatOptions(input.mailbox.sentiments)}`,
                `priorities: ${this.formatOptions(input.mailbox.priorities)}`,
                `tags: ${this.formatOptions(input.mailbox.tags)}`,
                `entities: ${this.formatOptionObjects(mailboxEntities)}`,
            ]),
            this.buildSection("OUTPUT RULES", [
                "category: devolver exactamente una opcion de mailbox.categories o null.",
                "sentiment: devolver exactamente una opcion de mailbox.sentiments o null.",
                "priority: devolver exactamente una opcion de mailbox.priorities o null.",
                "tags: devolver un array; puede incluir tags existentes y tambien tags nuevos.",
                "extractedEntities: usar labels de mailbox.entities cuando existan.",
            ]),
            this.buildSection("EMAIL METADATA", [
                `messageId: ${input.messageId}`,
                `fromName: ${input.fromName}`,
                `fromEmail: ${input.fromEmail}`,
                `subject: ${input.subject}`,
            ]),
            this.buildSection("BODY TEXT", [input.bodyText]),
            this.buildSection("NORMALIZED TEXT", [input.normalizedText]),
            this.buildSection("ATTACHMENTS OCR", [input.attachmentsOcrText]),
        ];

        return sections.filter(Boolean).join("\n\n");
    }

    private async findAffiliateId(data: {
        documentNumber?: string;
        cuil?: string;
        email?: string;
    }): Promise<any> {
        const searchTerms = [
            this.normalizeDigits(data.documentNumber),
            this.normalizeDigits(data.cuil),
            data.email,
        ].filter(Boolean) as string[];

        for (const term of searchTerms) {
            const affiliates = await this.affiliateService.search(term, 1, []);
            if (affiliates[0]?._id) {
                return affiliates[0]._id;
            }
        }

        return undefined;
    }

    private async syncMailboxTags(mailbox: IMailbox, aiTags: string[]): Promise<string[]> {
        const normalizedExistingTags = this.uniqueStrings((mailbox.tags || []).map((tag) => this.normalizeTag(tag)).filter(Boolean) as string[]);
        const normalizedAiTags = this.uniqueStrings(aiTags.map((tag) => this.normalizeTag(tag)).filter(Boolean) as string[]);
        const newTags = normalizedAiTags.filter((tag) => !normalizedExistingTags.includes(tag));

        if (newTags.length > 0) {
            await this.mailboxService.updatePartial(mailbox._id, {
                tags: [...normalizedExistingTags, ...newTags],
            } as Partial<IMailbox>);
        }

        return normalizedAiTags;
    }

    private sanitizeExtractedEntities(
        aiEntities: Array<{
            label: string;
            value?: string | null;
            source?: string | null;
            confidence?: number | null;
        }>
    ): NonNullable<IInboundEmailBase["extractedEntities"]> {
        const entities: NonNullable<IInboundEmailBase["extractedEntities"]> = [];

        for (const entity of aiEntities) {
            const label = this.normalizeString(entity.label);
            if (!label) {
                continue;
            }

            const value = this.normalizeString(entity.value || undefined);
            if (!value) {
                continue;
            }

            const duplicate = entities.find((item) => item.label === label && item.value === value);
            if (duplicate) {
                duplicate.confidence = Math.max(duplicate.confidence || 0, entity.confidence || 0);
                duplicate.source = duplicate.source || this.sanitizeEntitySource(entity.source || undefined);
                continue;
            }

            entities.push({
                label,
                value,
                source: this.sanitizeEntitySource(entity.source || undefined),
                confidence: typeof entity.confidence === "number" ? entity.confidence : undefined,
            });
        }

        return entities;
    }

    private sanitizeEntitySource(value?: string): "SUBJECT" | "BODY" | "ATTACHMENT" | "MANUAL" | undefined {
        const allowed = new Set(["SUBJECT", "BODY", "ATTACHMENT", "MANUAL"]);
        return value && allowed.has(value) ? value as "SUBJECT" | "BODY" | "ATTACHMENT" | "MANUAL" : undefined;
    }

    private normalizeText(value: string): string {
        return (value || "")
            .replace(/\u0000/g, " ")
            .replace(/\r/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/[ \t]+/g, " ")
            .trim();
    }

    private normalizeDigits(value?: string): string | undefined {
        if (!value) {
            return undefined;
        }

        const normalized = value.replace(/\D/g, "");
        return normalized || undefined;
    }

    private normalizePhone(value?: string): string | undefined {
        return this.normalizeDigits(value);
    }

    private normalizeString(value?: string | null): string | undefined {
        const normalized = value?.trim();
        return normalized || undefined;
    }

    private normalizeTag(value?: string | null): string | undefined {
        return this.normalizeString(value)?.toLowerCase();
    }

    private formatOptions(values?: string[]): string {
        const normalized = this.uniqueStrings((values || []).map((item) => this.normalizeString(item)).filter(Boolean) as string[]);
        return normalized.length ? normalized.join(", ") : "(sin definir)";
    }

    private formatOptionObjects(values?: Array<{ name: string; description?: string }>): string {
        if (!values?.length) {
            return "(sin definir)";
        }

        return values
            .map((item) => item.description ? `${item.name}: ${item.description}` : item.name)
            .join(" | ");
    }

    private buildSection(title: string, lines: Array<string | undefined>): string {
        const content = lines
            .map((line) => this.normalizeString(line))
            .filter(Boolean) as string[];

        if (content.length === 0) {
            return "";
        }

        return [`## ${title}`, ...content].join("\n");
    }

    private sanitizeFilename(filename: string): string {
        return filename.replace(/[^\w.\-]+/g, "_").slice(0, 180);
    }

    private sanitizePathSegment(segment: string): string {
        return segment.replace(/[^\w.-]+/g, "_");
    }

    private uniqueStrings(values: string[]): string[] {
        return Array.from(new Set(values.filter(Boolean)));
    }

    private parseAiOutput(output: unknown): InboundEmailAiExtraction {
        try {
            if (typeof output === "string") {
                const parsed = JSON.parse(output);
                return inboundEmailAiSchema.parse(parsed);
            }

            return inboundEmailAiSchema.parse(output);
        } catch (error) {
            this.logError("Invalid AI output while parsing inbound email analysis", error, {
                output,
                outputType: typeof output,
            });
            throw error;
        }
    }

    private logError(message: string, error: unknown, context?: ErrorContext): void {
        console.error(`[InboundEmailMailboxProvider] ${message}`, {
            context,
            error: this.serializeError(error),
        });
    }

    private formatError(error: unknown): string {
        if (error instanceof Error) {
            return error.stack || error.message;
        }

        if (typeof error === "string") {
            return error;
        }

        try {
            return JSON.stringify(error, null, 2);
        } catch {
            return String(error);
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
            const errorWithCause = error as Error & { cause?: unknown };
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: this.serializeError(errorWithCause.cause),
            };
        }

        if (typeof error === "string") {
            return error;
        }

        if (error === undefined || error === null) {
            return error;
        }

        try {
            return JSON.parse(JSON.stringify(error));
        } catch {
            return String(error);
        }
    }

    private resolveAiModelName(): string {
        return process.env.OPENAI_MODEL || process.env.OPENAI_DEFAULT_MODEL || "openai";
    }

    private readNumberEnv(key: string, fallback: number): number {
        const value = process.env[key];
        if (!value) {
            return fallback;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }
}

export default InboundEmailMailboxProvider;
export {InboundEmailMailboxProvider};
