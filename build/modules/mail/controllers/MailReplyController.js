import { z } from "zod";
import MailReplyService from "../services/MailReplyService.js";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";
import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";
import OutboundEmailPermissions from "../permissions/OutboundEmailPermissions.js";
const MailReplyBodySchema = z.object({
    subject: z.string().optional(),
    bodyText: z.string().optional(),
    bodyHtml: z.string().optional(),
    attachments: z.array(z.object({
        filename: z.string().optional(),
        filepath: z.string().optional(),
        size: z.number().optional(),
        mimetype: z.string().optional(),
        url: z.string().optional(),
    })).optional(),
    toEmails: z.array(z.string()).optional(),
    ccEmails: z.array(z.string()).optional(),
    bccEmails: z.array(z.string()).optional(),
    mailboxId: z.string().optional(),
    closeAfterSend: z.boolean().optional(),
    closeReason: z.string().nullable().optional(),
});
class MailReplyController {
    constructor(service = new MailReplyService()) {
        this.service = service;
    }
    async sendReply(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(InboundEmailPermissions.Update);
            const { inboundEmailId } = request.params;
            const payload = MailReplyBodySchema.parse(request.body || {});
            const userId = request.rbac.userId || request.rbac.getAuthUser?.id;
            const inboundEmailService = InboundEmailServiceFactory.instance;
            const inboundEmail = await inboundEmailService.findById(inboundEmailId || "");
            inboundEmailService.assertCanOperate(inboundEmail, userId, request.rbac.hasPermission(InboundEmailPermissions.Manage));
            const result = await this.service.sendReply(inboundEmailId || "", payload, userId);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error?.name === "ZodError") {
                return reply.status(400).send({
                    error: "MAIL_REPLY_INVALID_INPUT",
                    message: "Los datos de la respuesta no son validos.",
                    details: error.issues,
                });
            }
            if (error?.statusCode === 400 || error?.name === "BadRequestError") {
                return reply.status(400).send({
                    error: "MAIL_REPLY_INVALID_INPUT",
                    message: error?.message || "No se pudo enviar la respuesta. Revisá los datos requeridos.",
                });
            }
            if (error?.outboundEmail) {
                return reply.status(500).send({
                    error: "MAIL_REPLY_SEND_ERROR",
                    message: error?.message || "No se pudo enviar el correo.",
                    outboundEmail: error.outboundEmail,
                });
            }
            throw error;
        }
    }
    async sendForward(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(InboundEmailPermissions.Update);
            const { inboundEmailId } = request.params;
            const payload = MailReplyBodySchema.parse(request.body || {});
            const userId = request.rbac.userId || request.rbac.getAuthUser?.id;
            const inboundEmailService = InboundEmailServiceFactory.instance;
            const inboundEmail = await inboundEmailService.findById(inboundEmailId || "");
            inboundEmailService.assertCanOperate(inboundEmail, userId, request.rbac.hasPermission(InboundEmailPermissions.Manage));
            const result = await this.service.sendForward(inboundEmailId || "", payload, userId);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error?.name === "ZodError") {
                return reply.status(400).send({
                    error: "MAIL_FORWARD_INVALID_INPUT",
                    message: "Los datos del reenvio no son validos.",
                    details: error.issues,
                });
            }
            if (error?.statusCode === 400 || error?.name === "BadRequestError") {
                return reply.status(400).send({
                    error: "MAIL_FORWARD_INVALID_INPUT",
                    message: error?.message || "No se pudo reenviar el correo. Revisá los datos requeridos.",
                });
            }
            if (error?.outboundEmail) {
                return reply.status(500).send({
                    error: "MAIL_FORWARD_SEND_ERROR",
                    message: error?.message || "No se pudo reenviar el correo.",
                    outboundEmail: error.outboundEmail,
                });
            }
            throw error;
        }
    }
    async sendNew(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(OutboundEmailPermissions.Create);
            const payload = MailReplyBodySchema.parse(request.body || {});
            const userId = request.rbac.userId || request.rbac.getAuthUser?.id;
            const result = await this.service.sendNew(payload, userId);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error?.name === "ZodError") {
                return reply.status(400).send({
                    error: "MAIL_SEND_INVALID_INPUT",
                    message: "Los datos del correo no son validos.",
                    details: error.issues,
                });
            }
            if (error?.statusCode === 400 || error?.name === "BadRequestError") {
                return reply.status(400).send({
                    error: "MAIL_SEND_INVALID_INPUT",
                    message: error?.message || "No se pudo enviar el correo. Revisá los datos requeridos.",
                });
            }
            if (error?.outboundEmail) {
                return reply.status(500).send({
                    error: "MAIL_SEND_ERROR",
                    message: error?.message || "No se pudo enviar el correo.",
                    outboundEmail: error.outboundEmail,
                });
            }
            throw error;
        }
    }
}
export default MailReplyController;
export { MailReplyController };
