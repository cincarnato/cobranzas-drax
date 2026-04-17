import MailToolsController from "../controllers/MailToolsController.js";

async function MailToolsRoutes(fastify, options) {
    const controller = new MailToolsController();

    fastify.post(
        "/api/mail-tools/extract-text",
        {
            schema: {
                tags: ["mail"],
                summary: "Extract text from an uploaded image or PDF",
                body: {
                    type: "object",
                    required: ["file"],
                    properties: {
                        file: {
                            type: "object",
                            required: ["filepath"],
                            properties: {
                                url: {type: "string"},
                                filename: {type: "string"},
                                filepath: {type: "string"},
                                mimetype: {type: "string"},
                            },
                        },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            tool: {type: "string"},
                            mimetype: {type: ["string", "null"]},
                            filename: {type: ["string", "null"]},
                            filepath: {type: "string"},
                            text: {type: "string"},
                        },
                    },
                },
            },
        },
        (req, rep) => controller.extractText(req as any, rep)
    );
}

export default MailToolsRoutes;
export {MailToolsRoutes};
