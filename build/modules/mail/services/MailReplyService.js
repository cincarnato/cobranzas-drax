import { BadRequestError, ForbiddenError, NotFoundError } from "@drax/common-back";
import { EmailTransportService } from "@drax/email-back";
import { MediaService } from "@drax/media-back";
import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import OutboundEmailServiceFactory from "../factory/services/OutboundEmailServiceFactory.js";
import SessionEmailServiceFactory from "../factory/services/SessionEmailServiceFactory.js";
class MailReplyService {
    constructor() {
        this.mediaService = new MediaService();
    }
    async sendReply(inboundEmailId, payload, userId) {
        if (!inboundEmailId) {
            throw new BadRequestError("inbound email id is required");
        }
        const inboundEmail = await InboundEmailServiceFactory.instance.findById(inboundEmailId);
        if (!inboundEmail) {
            throw new NotFoundError();
        }
        const mailbox = await this.resolveMailbox(inboundEmail, payload.mailboxId);
        this.assertMailboxCanSend(mailbox);
        const toEmails = this.normalizeEmails(payload.toEmails?.length ? payload.toEmails : [
            inboundEmail.replyToEmail || inboundEmail.fromEmail || "",
        ]);
        const ccEmails = this.normalizeEmails(payload.ccEmails || []);
        const bccEmails = this.normalizeEmails(payload.bccEmails || []);
        const subject = this.resolveSubject(payload.subject, inboundEmail.subject);
        const bodyText = payload.bodyText?.trim() || "";
        const bodyHtml = payload.bodyHtml?.trim() || "";
        const attachments = this.normalizeAttachments(payload.attachments || []);
        const smtpAttachments = await this.buildSmtpAttachments(attachments);
        const closeReason = payload.closeReason || inboundEmail.closeReason || null;
        const replyContent = await this.buildReplyContent(bodyText, bodyHtml, inboundEmail);
        if (!toEmails.length) {
            throw new BadRequestError("at least one recipient is required");
        }
        if (!bodyText && !bodyHtml) {
            throw new BadRequestError("reply body is required");
        }
        if (payload.closeAfterSend && mailbox.closeReasonRequired && !closeReason) {
            throw new BadRequestError("Este mailbox requiere un motivo de cierre antes de cerrar la gestión.");
        }
        const fromEmail = mailbox.email;
        const sentAt = new Date();
        const references = this.buildReplyReferences(inboundEmail);
        let outboundEmail = await OutboundEmailServiceFactory.instance.create({
            inboundEmail: inboundEmail._id,
            mailbox: mailbox._id,
            user: userId,
            fromEmail,
            toEmails,
            ccEmails,
            bccEmails,
            subject,
            bodyText,
            bodyHtml,
            attachments,
            status: "SENDING",
            inReplyTo: inboundEmail.messageId,
            references,
            attempts: 1,
        });
        try {
            const emailTransport = new EmailTransportService("smtp", this.getSmtpConfig(mailbox));
            const sendResult = await emailTransport.sendEmail({
                from: fromEmail,
                to: toEmails,
                cc: ccEmails.length ? ccEmails : undefined,
                bcc: bccEmails.length ? bccEmails : undefined,
                subject,
                text: replyContent.text || undefined,
                html: replyContent.html || undefined,
                attachments: smtpAttachments.length ? smtpAttachments : undefined,
                inReplyTo: inboundEmail.messageId || undefined,
                references: references.length ? references : undefined,
            });
            outboundEmail = await OutboundEmailServiceFactory.instance.updatePartial(outboundEmail._id, {
                status: "SENT",
                messageId: sendResult?.messageId,
                sentAt,
                attempts: 1,
            });
            const updatedInboundEmail = await this.registerInboundReply(inboundEmail, sentAt, payload.closeAfterSend, closeReason, userId);
            await SessionEmailServiceFactory.instance.onInboundEmailReplied(inboundEmail);
            if (payload.closeAfterSend) {
                await SessionEmailServiceFactory.instance.onInboundEmailClosed(inboundEmail, userId);
            }
            return {
                inboundEmail: updatedInboundEmail,
                outboundEmail,
            };
        }
        catch (error) {
            outboundEmail = await OutboundEmailServiceFactory.instance.updatePartial(outboundEmail._id, {
                status: "FAILED",
                lastError: error?.message || "No se pudo enviar el correo.",
                attempts: 1,
            });
            throw Object.assign(error, { outboundEmail });
        }
    }
    async sendForward(inboundEmailId, payload, userId) {
        if (!inboundEmailId) {
            throw new BadRequestError("inbound email id is required");
        }
        const inboundEmail = await InboundEmailServiceFactory.instance.findById(inboundEmailId);
        if (!inboundEmail) {
            throw new NotFoundError();
        }
        const mailbox = await this.resolveMailbox(inboundEmail, payload.mailboxId);
        this.assertMailboxCanSend(mailbox);
        const toEmails = this.normalizeEmails(payload.toEmails || []);
        const ccEmails = this.normalizeEmails(payload.ccEmails || []);
        const bccEmails = this.normalizeEmails(payload.bccEmails || []);
        const subject = this.resolveForwardSubject(payload.subject, inboundEmail.subject);
        const bodyText = payload.bodyText?.trim() || "";
        const bodyHtml = payload.bodyHtml?.trim() || "";
        const attachments = this.normalizeAttachments(payload.attachments === undefined
            ? inboundEmail.attachments || []
            : payload.attachments);
        const smtpAttachments = await this.buildSmtpAttachments(attachments);
        const closeReason = payload.closeReason || inboundEmail.closeReason || null;
        const forwardContent = this.buildForwardContent(bodyText, bodyHtml, inboundEmail);
        if (!toEmails.length) {
            throw new BadRequestError("at least one recipient is required");
        }
        if (!bodyText && !bodyHtml) {
            throw new BadRequestError("forward body is required");
        }
        if (payload.closeAfterSend && mailbox.closeReasonRequired && !closeReason) {
            throw new BadRequestError("Este mailbox requiere un motivo de cierre antes de cerrar la gestión.");
        }
        const fromEmail = mailbox.email;
        const sentAt = new Date();
        let outboundEmail = await OutboundEmailServiceFactory.instance.create({
            inboundEmail: inboundEmail._id,
            mailbox: mailbox._id,
            user: userId,
            fromEmail,
            toEmails,
            ccEmails,
            bccEmails,
            subject,
            bodyText,
            bodyHtml,
            attachments,
            status: "SENDING",
            attempts: 1,
        });
        try {
            const emailTransport = new EmailTransportService("smtp", this.getSmtpConfig(mailbox));
            const sendResult = await emailTransport.sendEmail({
                from: fromEmail,
                to: toEmails,
                cc: ccEmails.length ? ccEmails : undefined,
                bcc: bccEmails.length ? bccEmails : undefined,
                subject,
                text: forwardContent.text || undefined,
                html: forwardContent.html || undefined,
                attachments: smtpAttachments.length ? smtpAttachments : undefined,
            });
            outboundEmail = await OutboundEmailServiceFactory.instance.updatePartial(outboundEmail._id, {
                status: "SENT",
                messageId: sendResult?.messageId,
                sentAt,
                attempts: 1,
            });
            const updatedInboundEmail = await this.registerInboundReply(inboundEmail, sentAt, payload.closeAfterSend, closeReason, userId);
            await SessionEmailServiceFactory.instance.onInboundEmailReplied(inboundEmail);
            if (payload.closeAfterSend) {
                await SessionEmailServiceFactory.instance.onInboundEmailClosed(inboundEmail, userId);
            }
            return {
                inboundEmail: updatedInboundEmail,
                outboundEmail,
            };
        }
        catch (error) {
            outboundEmail = await OutboundEmailServiceFactory.instance.updatePartial(outboundEmail._id, {
                status: "FAILED",
                lastError: error?.message || "No se pudo reenviar el correo.",
                attempts: 1,
            });
            throw Object.assign(error, { outboundEmail });
        }
    }
    async sendNew(payload, userId) {
        if (!payload.mailboxId) {
            throw new BadRequestError("mailbox id is required");
        }
        const mailbox = await MailboxServiceFactory.instance.findById(payload.mailboxId);
        if (!mailbox) {
            throw new NotFoundError("mailbox not found");
        }
        this.assertMailboxOperator(mailbox, userId);
        this.assertMailboxCanSend(mailbox);
        const toEmails = this.normalizeEmails(payload.toEmails || []);
        const ccEmails = this.normalizeEmails(payload.ccEmails || []);
        const bccEmails = this.normalizeEmails(payload.bccEmails || []);
        const subject = payload.subject?.trim() || "";
        const bodyText = payload.bodyText?.trim() || "";
        const bodyHtml = payload.bodyHtml?.trim() || "";
        const attachments = this.normalizeAttachments(payload.attachments || []);
        const smtpAttachments = await this.buildSmtpAttachments(attachments);
        if (!toEmails.length) {
            throw new BadRequestError("at least one recipient is required");
        }
        if (!subject) {
            throw new BadRequestError("subject is required");
        }
        if (!bodyText && !bodyHtml) {
            throw new BadRequestError("mail body is required");
        }
        const fromEmail = mailbox.email;
        const sentAt = new Date();
        let outboundEmail = await OutboundEmailServiceFactory.instance.create({
            mailbox: mailbox._id,
            user: userId,
            fromEmail,
            toEmails,
            ccEmails,
            bccEmails,
            subject,
            bodyText,
            bodyHtml,
            attachments,
            status: "SENDING",
            attempts: 1,
        });
        try {
            const emailTransport = new EmailTransportService("smtp", this.getSmtpConfig(mailbox));
            const sendResult = await emailTransport.sendEmail({
                from: fromEmail,
                to: toEmails,
                cc: ccEmails.length ? ccEmails : undefined,
                bcc: bccEmails.length ? bccEmails : undefined,
                subject,
                text: bodyText || undefined,
                html: bodyHtml || undefined,
                attachments: smtpAttachments.length ? smtpAttachments : undefined,
            });
            outboundEmail = await OutboundEmailServiceFactory.instance.updatePartial(outboundEmail._id, {
                status: "SENT",
                messageId: sendResult?.messageId,
                sentAt,
                attempts: 1,
            });
            return { outboundEmail };
        }
        catch (error) {
            outboundEmail = await OutboundEmailServiceFactory.instance.updatePartial(outboundEmail._id, {
                status: "FAILED",
                lastError: error?.message || "No se pudo enviar el correo.",
                attempts: 1,
            });
            throw Object.assign(error, { outboundEmail });
        }
    }
    async resolveMailbox(inboundEmail, mailboxId) {
        if (mailboxId) {
            const mailbox = await MailboxServiceFactory.instance.findById(mailboxId);
            if (mailbox) {
                return mailbox;
            }
        }
        if (inboundEmail.mailbox) {
            const byEmail = await MailboxServiceFactory.instance.findOneBy("email", inboundEmail.mailbox);
            if (byEmail) {
                return byEmail;
            }
            try {
                const byId = await MailboxServiceFactory.instance.findById(inboundEmail.mailbox);
                if (byId) {
                    return byId;
                }
            }
            catch {
                // mailbox is commonly stored as an email address; ignore invalid ObjectId fallbacks.
            }
        }
        throw new NotFoundError("mailbox not found");
    }
    assertMailboxCanSend(mailbox) {
        if (!mailbox.smtpEnabled) {
            throw new BadRequestError("mailbox smtp is disabled");
        }
        if (!mailbox.smtpHost || !mailbox.smtpPort || !mailbox.username || !mailbox.password) {
            throw new BadRequestError("mailbox smtp configuration is incomplete");
        }
    }
    assertMailboxOperator(mailbox, userId) {
        const operatorIds = (mailbox.operators || [])
            .map((operator) => typeof operator === "object" ? operator?._id?.toString() || operator?.id?.toString() : operator?.toString())
            .filter(Boolean);
        if (!operatorIds.length || !userId || !operatorIds.includes(userId)) {
            throw new ForbiddenError();
        }
    }
    getSmtpConfig(mailbox) {
        return {
            host: mailbox.smtpHost,
            port: Number(mailbox.smtpPort),
            secure: Boolean(mailbox.smtpTls),
            ignoreTLS: false,
            auth: {
                type: "login",
                user: mailbox.username,
                pass: mailbox.password,
            },
        };
    }
    normalizeAttachments(attachments) {
        return attachments
            .filter((attachment) => attachment?.filename && (attachment.filepath || attachment.url))
            .map((attachment) => ({
            filename: attachment.filename,
            filepath: attachment.filepath,
            size: Number(attachment.size || 0),
            mimetype: attachment.mimetype,
            url: attachment.url,
        }));
    }
    async buildSmtpAttachments(attachments) {
        const result = [];
        for (const attachment of attachments) {
            const path = await this.resolveAttachmentPath(attachment);
            result.push({
                filename: attachment.filename,
                path,
                contentType: attachment.mimetype,
            });
        }
        return result;
    }
    async resolveAttachmentPath(attachment) {
        const fromUrl = this.parseMediaUrl(attachment.url);
        if (fromUrl) {
            const file = await this.mediaService.getFile({ ...fromUrl, registerHit: false });
            return file.absolutePath;
        }
        const fromFilepath = this.parseRelativeMediaPath(attachment.filepath);
        if (fromFilepath) {
            const file = await this.mediaService.getFile({ ...fromFilepath, registerHit: false });
            return file.absolutePath;
        }
        throw new BadRequestError(`No se pudo resolver el adjunto ${attachment.filename || ""}`.trim());
    }
    parseMediaUrl(value) {
        if (!value)
            return null;
        try {
            const url = new URL(value, "http://localhost");
            const parts = url.pathname.split("/").filter(Boolean);
            const fileIndex = parts.findIndex((part) => part === "file");
            if (fileIndex < 0 || parts.length !== fileIndex + 5)
                return null;
            return {
                dir: parts[fileIndex + 1],
                year: parts[fileIndex + 2],
                month: parts[fileIndex + 3],
                filename: decodeURIComponent(parts[fileIndex + 4]),
            };
        }
        catch {
            return null;
        }
    }
    parseRelativeMediaPath(value) {
        if (!value)
            return null;
        const parts = value.split(/[\\/]+/).filter(Boolean);
        const yearIndex = parts.findIndex((part, index) => /^\d{4}$/.test(part) &&
            /^\d{2}$/.test(parts[index + 1] || "") &&
            Boolean(parts[index + 2]));
        if (yearIndex <= 0 || parts.length !== yearIndex + 3)
            return null;
        return {
            dir: parts[yearIndex - 1],
            year: parts[yearIndex],
            month: parts[yearIndex + 1],
            filename: parts[yearIndex + 2],
        };
    }
    async registerInboundReply(inboundEmail, sentAt, closeAfterSend, closeReason, userId) {
        const replyCount = (inboundEmail.replyCount || 0) + 1;
        const update = {
            replyCount,
            firstRepliedAt: inboundEmail.firstRepliedAt || sentAt,
            lastRepliedAt: sentAt,
            attentionStatus: closeAfterSend ? "CLOSED" : (inboundEmail.attentionStatus || "ASSIGNED"),
        };
        if (closeAfterSend) {
            update.closedAt = sentAt;
            update.closedBy = userId;
            update.assignedTo = userId;
        }
        if (closeAfterSend && (closeReason || inboundEmail.closeReason)) {
            update.closeReason = closeReason || inboundEmail.closeReason;
        }
        return await InboundEmailServiceFactory.instance.updatePartial(inboundEmail._id, update);
    }
    resolveSubject(inputSubject, inboundSubject) {
        const subject = inputSubject?.trim() || inboundSubject?.trim() || "Sin asunto";
        return /^re:/i.test(subject) ? subject : `Re: ${subject}`;
    }
    resolveForwardSubject(inputSubject, inboundSubject) {
        const subject = inputSubject?.trim() || inboundSubject?.trim() || "Sin asunto";
        return /^fw(d)?:/i.test(subject) ? subject : `Fwd: ${subject}`;
    }
    async buildReplyContent(bodyText, bodyHtml, inboundEmail) {
        const inboundThread = await InboundEmailServiceFactory.instance.findThread(inboundEmail);
        const outboundThread = await OutboundEmailServiceFactory.instance.findByInboundEmailIds(inboundThread.map((item) => item._id));
        const entries = this.buildThreadEntries(inboundThread, outboundThread);
        return {
            text: this.appendTextHistory(bodyText, entries),
            html: this.appendHtmlHistory(bodyHtml || this.textToHtml(bodyText), entries),
        };
    }
    buildForwardContent(bodyText, bodyHtml, inboundEmail) {
        const originalText = this.htmlToText(inboundEmail.bodyHtml || "") || inboundEmail.bodyText || "";
        const originalHtml = inboundEmail.bodyHtml?.trim()
            ? this.sanitizeEmailHtml(inboundEmail.bodyHtml)
            : this.textToHtml(inboundEmail.bodyText || "");
        const headerText = [
            "---------- Mensaje reenviado ---------",
            `De: ${this.formatSender(inboundEmail.fromName, inboundEmail.fromEmail) || "remitente"}`,
            `Fecha: ${this.formatReplyDate(inboundEmail.receivedAt)}`,
            `Asunto: ${inboundEmail.subject || "Sin asunto"}`,
            `Para: ${(inboundEmail.toEmails || []).join(", ")}`,
        ].filter(Boolean).join("\n");
        const headerHtml = [
            `<div>---------- Mensaje reenviado ---------</div>`,
            `<div><b>De:</b> ${this.escapeHtml(this.formatSender(inboundEmail.fromName, inboundEmail.fromEmail) || "remitente")}</div>`,
            `<div><b>Fecha:</b> ${this.escapeHtml(this.formatReplyDate(inboundEmail.receivedAt))}</div>`,
            `<div><b>Asunto:</b> ${this.escapeHtml(inboundEmail.subject || "Sin asunto")}</div>`,
            `<div><b>Para:</b> ${this.escapeHtml((inboundEmail.toEmails || []).join(", "))}</div>`,
        ].join("");
        return {
            text: [bodyText, headerText, originalText].filter(Boolean).join("\n\n"),
            html: [bodyHtml || this.textToHtml(bodyText), headerHtml, originalHtml].filter(Boolean).join("<br>"),
        };
    }
    buildThreadEntries(inboundThread, outboundThread) {
        return [
            ...inboundThread.map((item) => ({
                type: "INBOUND",
                date: item.receivedAt,
                from: this.formatSender(item.fromName, item.fromEmail),
                toEmails: item.toEmails || [],
                subject: item.subject,
                bodyText: item.bodyText,
                bodyHtml: item.bodyHtml,
            })),
            ...outboundThread.map((item) => ({
                type: "OUTBOUND",
                date: item.sentAt || item.createdAt,
                from: item.fromEmail,
                toEmails: item.toEmails || [],
                subject: item.subject,
                bodyText: item.bodyText,
                bodyHtml: item.bodyHtml,
            })),
        ]
            .filter((entry) => Boolean(entry.bodyText?.trim() || entry.bodyHtml?.trim()))
            .sort((a, b) => this.entryTimestamp(a) - this.entryTimestamp(b));
    }
    appendTextHistory(bodyText, entries) {
        if (!entries.length)
            return bodyText;
        const quotedEntries = entries
            .map((entry) => {
            const content = this.htmlToText(entry.bodyHtml || "") || entry.bodyText || "";
            const quotedBody = this.quoteText(content);
            if (!quotedBody)
                return "";
            return [
                `El ${this.formatReplyDate(entry.date)}, ${entry.from || "remitente"} escribió:`,
                quotedBody,
            ].join("\n");
        })
            .filter(Boolean);
        return [bodyText, ...quotedEntries].filter(Boolean).join("\n\n");
    }
    appendHtmlHistory(bodyHtml, entries) {
        if (!entries.length)
            return bodyHtml;
        const quotedEntries = entries
            .map((entry) => {
            const contentHtml = entry.bodyHtml?.trim()
                ? this.sanitizeEmailHtml(entry.bodyHtml)
                : this.textToHtml(entry.bodyText || "");
            if (!contentHtml.trim())
                return "";
            return [
                `<div class="gmail_quote">`,
                `<div>El ${this.escapeHtml(this.formatReplyDate(entry.date))}, ${this.escapeHtml(entry.from || "remitente")} escribió:</div>`,
                `<blockquote style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">${contentHtml}</blockquote>`,
                `</div>`,
            ].join("");
        })
            .filter(Boolean);
        return [bodyHtml, ...quotedEntries].filter(Boolean).join("<br>");
    }
    quoteText(value) {
        return value
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n")
            .trim();
    }
    htmlToText(value) {
        return value
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }
    textToHtml(value) {
        return this.escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
    }
    sanitizeEmailHtml(value) {
        return value
            .replace(/<\s*(script|style|iframe|object|embed|meta|link)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
            .replace(/<\s*(script|style|iframe|object|embed|meta|link)\b[^>]*\/?\s*>/gi, "")
            .replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, "")
            .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "")
            .trim();
    }
    escapeHtml(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    formatSender(name, email) {
        const cleanName = name?.trim();
        const cleanEmail = email?.trim();
        if (cleanName && cleanEmail)
            return `${cleanName} <${cleanEmail}>`;
        return cleanName || cleanEmail || "";
    }
    formatReplyDate(value) {
        const date = value ? new Date(value) : new Date();
        return Number.isNaN(date.getTime()) ? "fecha desconocida" : date.toLocaleString("es-AR");
    }
    entryTimestamp(entry) {
        const date = entry.date ? new Date(entry.date) : new Date(0);
        return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    }
    buildReplyReferences(inboundEmail) {
        const references = [
            ...(inboundEmail.references || []),
            inboundEmail.inReplyTo,
            inboundEmail.messageId,
        ];
        return [...new Set(references.map((value) => value?.trim()).filter((value) => Boolean(value)))];
    }
    normalizeEmails(emails) {
        return emails
            .map((email) => email.trim())
            .filter(Boolean);
    }
}
export default MailReplyService;
export { MailReplyService };
