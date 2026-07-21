import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {z} from "zod";
import MailReplyService from "../services/MailReplyService.js";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";

const MailReplyBodySchema = z.object({
    subject: z.string().optional(),
    bodyText: z.string().optional(),
    bodyHtml: z.string().optional(),
    toEmails: z.array(z.string()).optional(),
    ccEmails: z.array(z.string()).optional(),
    bccEmails: z.array(z.string()).optional(),
    mailboxId: z.string().optional(),
    closeAfterSend: z.boolean().optional(),
});

class MailReplyController {
    private service: MailReplyService;

    constructor(service: MailReplyService = new MailReplyService()) {
        this.service = service;
    }

    async sendReply(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(InboundEmailPermissions.Manage);

            const {inboundEmailId} = request.params as {inboundEmailId?: string};
            const payload = MailReplyBodySchema.parse(request.body || {});
            const userId = request.rbac.userId || request.rbac.getAuthUser?.id;
            const result = await this.service.sendReply(inboundEmailId || "", payload, userId);

            return reply.status(200).send(result);
        } catch (error: any) {
            if (error?.name === "ZodError") {
                return reply.status(400).send({
                    error: "MAIL_REPLY_INVALID_INPUT",
                    message: "Los datos de la respuesta no son validos.",
                    details: error.issues,
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
}

export default MailReplyController;
export {MailReplyController};
