import MailReplyController from "../controllers/MailReplyController.js";

async function MailReplyRoutes(fastify, options) {
    const controller = new MailReplyController();

    fastify.post(
        "/api/mail-replies/:inboundEmailId/send",
        {
            schema: {
                tags: ["mail"],
                summary: "Send a reply for an inbound email",
                params: {
                    type: "object",
                    required: ["inboundEmailId"],
                    properties: {
                        inboundEmailId: {type: "string"},
                    },
                },
                body: {
                    type: "object",
                    properties: {
                        subject: {type: "string"},
                        bodyText: {type: "string"},
                        bodyHtml: {type: "string"},
                        toEmails: {type: "array", items: {type: "string"}},
                        ccEmails: {type: "array", items: {type: "string"}},
                        bccEmails: {type: "array", items: {type: "string"}},
                        mailboxId: {type: "string"},
                        closeAfterSend: {type: "boolean"},
                    },
                },
            },
        },
        (req, rep) => controller.sendReply(req as any, rep)
    );
}

export default MailReplyRoutes;
export {MailReplyRoutes};
