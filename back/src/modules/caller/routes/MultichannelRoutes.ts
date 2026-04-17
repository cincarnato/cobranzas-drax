import MultichannelController from "../controllers/MultichannelController.js";

async function MultichannelFastifyRoutes(fastify, options) {
    const controller: MultichannelController = new MultichannelController();

    fastify.post(
        '/api/multichannel/send-whatsapp-template',
        {
            schema: {
                tags: ["caller"],
                summary: "Send a WhatsApp Business template through Multichannel",
                body: {
                    type: "object",
                    required: ["destinatario", "template"],
                    properties: {
                        destinatario: { type: "string" },
                        template: { type: "string" },
                        variables: {
                            type: "object",
                            additionalProperties: { type: "string" },
                        },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            data: {
                                type: "array",
                                items: { type: "string" },
                            },
                            status: {
                                type: "object",
                                properties: {
                                    code: { type: "number" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            status: {
                                type: "object",
                                properties: {
                                    code: { type: "number" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                    404: {
                        type: "object",
                        properties: {
                            status: {
                                type: "object",
                                properties: {
                                    code: { type: "number" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                    406: {
                        type: "object",
                        properties: {
                            status: {
                                type: "object",
                                properties: {
                                    code: { type: "number" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        (req, rep) => controller.sendWhatsappTemplate(req as any, rep)
    );
}

export default MultichannelFastifyRoutes;
export { MultichannelFastifyRoutes }
