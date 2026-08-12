import MailReplyController from "../controllers/MailReplyController.js";
async function MailReplyRoutes(fastify, options) {
    const controller = new MailReplyController();
    fastify.post("/api/mail-replies/send", {
        schema: {
            tags: ["mail"],
            summary: "Send a standalone email",
            body: {
                type: "object",
                properties: {
                    subject: { type: "string" },
                    bodyText: { type: "string" },
                    bodyHtml: { type: "string" },
                    toEmails: { type: "array", items: { type: "string" } },
                    ccEmails: { type: "array", items: { type: "string" } },
                    bccEmails: { type: "array", items: { type: "string" } },
                    mailboxId: { type: "string" },
                    attachments: { type: "array", items: { type: "object" } },
                },
            },
        },
    }, (req, rep) => controller.sendNew(req, rep));
    fastify.post("/api/mail-replies/:inboundEmailId/send", {
        schema: {
            tags: ["mail"],
            summary: "Send a reply for an inbound email",
            params: {
                type: "object",
                required: ["inboundEmailId"],
                properties: {
                    inboundEmailId: { type: "string" },
                },
            },
            body: {
                type: "object",
                properties: {
                    subject: { type: "string" },
                    bodyText: { type: "string" },
                    bodyHtml: { type: "string" },
                    toEmails: { type: "array", items: { type: "string" } },
                    ccEmails: { type: "array", items: { type: "string" } },
                    bccEmails: { type: "array", items: { type: "string" } },
                    mailboxId: { type: "string" },
                    attachments: { type: "array", items: { type: "object" } },
                    closeAfterSend: { type: "boolean" },
                    closeReason: { type: ["string", "null"] },
                },
            },
        },
    }, (req, rep) => controller.sendReply(req, rep));
    fastify.post("/api/mail-replies/:inboundEmailId/forward", {
        schema: {
            tags: ["mail"],
            summary: "Forward an inbound email",
            params: {
                type: "object",
                required: ["inboundEmailId"],
                properties: {
                    inboundEmailId: { type: "string" },
                },
            },
            body: {
                type: "object",
                properties: {
                    subject: { type: "string" },
                    bodyText: { type: "string" },
                    bodyHtml: { type: "string" },
                    toEmails: { type: "array", items: { type: "string" } },
                    ccEmails: { type: "array", items: { type: "string" } },
                    bccEmails: { type: "array", items: { type: "string" } },
                    mailboxId: { type: "string" },
                    attachments: { type: "array", items: { type: "object" } },
                    closeAfterSend: { type: "boolean" },
                    closeReason: { type: ["string", "null"] },
                },
            },
        },
    }, (req, rep) => controller.sendForward(req, rep));
}
export default MailReplyRoutes;
export { MailReplyRoutes };
