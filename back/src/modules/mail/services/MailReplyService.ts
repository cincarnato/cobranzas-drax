import {BadRequestError, ForbiddenError, NotFoundError} from "@drax/common-back";
import {EmailTransportService, type TransportSmtpConfig} from "@drax/email-back";
import {MediaService} from "@drax/media-back";
import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import OutboundEmailServiceFactory from "../factory/services/OutboundEmailServiceFactory.js";
import SessionEmailServiceFactory from "../factory/services/SessionEmailServiceFactory.js";
import type {IInboundEmail} from "../interfaces/IInboundEmail";
import type {IMailbox} from "../interfaces/IMailbox";
import type {IOutboundEmail, IOutboundEmailAttachment} from "../interfaces/IOutboundEmail";

type MailReplyPayload = {
    subject?: string;
    bodyText?: string;
    bodyHtml?: string;
    toEmails?: string[];
    ccEmails?: string[];
    bccEmails?: string[];
    attachments?: IOutboundEmailAttachment[];
    mailboxId?: string;
    closeAfterSend?: boolean;
    closeReason?: string | null;
};

type MailReplyResult = {
    inboundEmail: IInboundEmail;
    outboundEmail: IOutboundEmail;
};

type MailSendResult = {
    outboundEmail: IOutboundEmail;
};

class MailReplyService {
    private mediaService = new MediaService();

    async sendReply(inboundEmailId: string, payload: MailReplyPayload, userId?: string): Promise<MailReplyResult> {
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
                text: bodyText || undefined,
                html: bodyHtml || undefined,
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
        } catch (error: any) {
            outboundEmail = await OutboundEmailServiceFactory.instance.updatePartial(outboundEmail._id, {
                status: "FAILED",
                lastError: error?.message || "No se pudo enviar el correo.",
                attempts: 1,
            });

            throw Object.assign(error, {outboundEmail});
        }
    }

    async sendNew(payload: MailReplyPayload, userId?: string): Promise<MailSendResult> {
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

            return {outboundEmail};
        } catch (error: any) {
            outboundEmail = await OutboundEmailServiceFactory.instance.updatePartial(outboundEmail._id, {
                status: "FAILED",
                lastError: error?.message || "No se pudo enviar el correo.",
                attempts: 1,
            });

            throw Object.assign(error, {outboundEmail});
        }
    }

    private async resolveMailbox(inboundEmail: IInboundEmail, mailboxId?: string): Promise<IMailbox> {
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
            } catch {
                // mailbox is commonly stored as an email address; ignore invalid ObjectId fallbacks.
            }
        }

        throw new NotFoundError("mailbox not found");
    }

    private assertMailboxCanSend(mailbox: IMailbox) {
        if (!mailbox.smtpEnabled) {
            throw new BadRequestError("mailbox smtp is disabled");
        }
        if (!mailbox.smtpHost || !mailbox.smtpPort || !mailbox.username || !mailbox.password) {
            throw new BadRequestError("mailbox smtp configuration is incomplete");
        }
    }

    private assertMailboxOperator(mailbox: IMailbox, userId?: string) {
        const operatorIds = (mailbox.operators || [])
            .map((operator: any) => typeof operator === "object" ? operator?._id?.toString() || operator?.id?.toString() : operator?.toString())
            .filter(Boolean);
        if (!operatorIds.length || !userId || !operatorIds.includes(userId)) {
            throw new ForbiddenError();
        }
    }

    private getSmtpConfig(mailbox: IMailbox): TransportSmtpConfig {
        return {
            host: mailbox.smtpHost as string,
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

    private normalizeAttachments(attachments: IOutboundEmailAttachment[]): IOutboundEmailAttachment[] {
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

    private async buildSmtpAttachments(attachments: IOutboundEmailAttachment[]) {
        const result: Array<{filename?: string; path: string; contentType?: string}> = [];

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

    private async resolveAttachmentPath(attachment: IOutboundEmailAttachment): Promise<string> {
        const fromUrl = this.parseMediaUrl(attachment.url);
        if (fromUrl) {
            const file = await this.mediaService.getFile({...fromUrl, registerHit: false});
            return file.absolutePath;
        }

        const fromFilepath = this.parseRelativeMediaPath(attachment.filepath);
        if (fromFilepath) {
            const file = await this.mediaService.getFile({...fromFilepath, registerHit: false});
            return file.absolutePath;
        }

        throw new BadRequestError(`No se pudo resolver el adjunto ${attachment.filename || ""}`.trim());
    }

    private parseMediaUrl(value?: string): {dir: string; year: string; month: string; filename: string} | null {
        if (!value) return null;
        try {
            const url = new URL(value, "http://localhost");
            const parts = url.pathname.split("/").filter(Boolean);
            const fileIndex = parts.findIndex((part) => part === "file");
            if (fileIndex < 0 || parts.length !== fileIndex + 5) return null;
            return {
                dir: parts[fileIndex + 1],
                year: parts[fileIndex + 2],
                month: parts[fileIndex + 3],
                filename: decodeURIComponent(parts[fileIndex + 4]),
            };
        } catch {
            return null;
        }
    }

    private parseRelativeMediaPath(value?: string): {dir: string; year: string; month: string; filename: string} | null {
        if (!value) return null;
        const parts = value.split(/[\\/]+/).filter(Boolean);
        const yearIndex = parts.findIndex((part, index) =>
            /^\d{4}$/.test(part) &&
            /^\d{2}$/.test(parts[index + 1] || "") &&
            Boolean(parts[index + 2])
        );
        if (yearIndex <= 0 || parts.length !== yearIndex + 3) return null;
        return {
            dir: parts[yearIndex - 1],
            year: parts[yearIndex],
            month: parts[yearIndex + 1],
            filename: parts[yearIndex + 2],
        };
    }

    private async registerInboundReply(inboundEmail: IInboundEmail, sentAt: Date, closeAfterSend?: boolean, closeReason?: string | null, userId?: string): Promise<IInboundEmail> {
        const replyCount = (inboundEmail.replyCount || 0) + 1;
        const update: Partial<IInboundEmail> = {
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

    private resolveSubject(inputSubject?: string, inboundSubject?: string): string {
        const subject = inputSubject?.trim() || inboundSubject?.trim() || "Sin asunto";
        return /^re:/i.test(subject) ? subject : `Re: ${subject}`;
    }

    private buildReplyReferences(inboundEmail: IInboundEmail): string[] {
        const references = [
            ...(inboundEmail.references || []),
            inboundEmail.inReplyTo,
            inboundEmail.messageId,
        ];
        return [...new Set(references.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
    }

    private normalizeEmails(emails: string[]): string[] {
        return emails
            .map((email) => email.trim())
            .filter(Boolean);
    }
}

export default MailReplyService;
export {MailReplyService};
export type {MailReplyPayload, MailReplyResult, MailSendResult};
