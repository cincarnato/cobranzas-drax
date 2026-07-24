import {BadRequestError, NotFoundError} from "@drax/common-back";
import {EmailTransportService, type TransportSmtpConfig} from "@drax/email-back";
import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import OutboundEmailServiceFactory from "../factory/services/OutboundEmailServiceFactory.js";
import type {IInboundEmail} from "../interfaces/IInboundEmail";
import type {IMailbox} from "../interfaces/IMailbox";
import type {IOutboundEmail} from "../interfaces/IOutboundEmail";

type MailReplyPayload = {
    subject?: string;
    bodyText?: string;
    bodyHtml?: string;
    toEmails?: string[];
    ccEmails?: string[];
    bccEmails?: string[];
    mailboxId?: string;
    closeAfterSend?: boolean;
    closeReason?: string | null;
};

type MailReplyResult = {
    inboundEmail: IInboundEmail;
    outboundEmail: IOutboundEmail;
};

class MailReplyService {
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
                inReplyTo: inboundEmail.messageId || undefined,
                references: references.length ? references : undefined,
            });

            outboundEmail = await OutboundEmailServiceFactory.instance.updatePartial(outboundEmail._id, {
                status: "SENT",
                messageId: sendResult?.messageId,
                sentAt,
                attempts: 1,
            });

            const updatedInboundEmail = await this.registerInboundReply(inboundEmail, sentAt, payload.closeAfterSend, closeReason);

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

    private async registerInboundReply(inboundEmail: IInboundEmail, sentAt: Date, closeAfterSend?: boolean, closeReason?: string | null): Promise<IInboundEmail> {
        const replyCount = (inboundEmail.replyCount || 0) + 1;
        const update: Partial<IInboundEmail> = {
            replyCount,
            firstRepliedAt: inboundEmail.firstRepliedAt || sentAt,
            lastRepliedAt: sentAt,
            attentionStatus: closeAfterSend ? "CLOSED" : (inboundEmail.attentionStatus || "ASSIGNED"),
        };
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
export type {MailReplyPayload, MailReplyResult};
