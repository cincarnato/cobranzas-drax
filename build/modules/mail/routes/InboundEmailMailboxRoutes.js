import InboundEmailMailboxController from "../controllers/InboundEmailMailboxController.js";
async function InboundEmailMailboxRoutes(fastify, options) {
    const controller = new InboundEmailMailboxController();
    fastify.post("/api/inbound-email-mailbox/sync", {
        schema: {
            tags: ["mail"],
            summary: "Run inbound email mailbox sync manually",
            response: {
                200: {
                    type: "object",
                    properties: {
                        processedMailboxes: { type: "number" },
                        createdEmails: { type: "number" },
                        fetchedEmails: { type: "number" },
                        skippedEmails: { type: "number" },
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    mailboxId: { type: "string" },
                                    error: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
    }, (req, rep) => controller.sync(req, rep));
}
export default InboundEmailMailboxRoutes;
export { InboundEmailMailboxRoutes };
