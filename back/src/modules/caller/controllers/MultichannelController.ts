import type { FastifyReply } from "fastify";
import type { SendWhatsappTemplateParams } from "../providers/MultichannelProvider.js";
import { MultichannelProviderError } from "../providers/MultichannelProvider.js";
import MultichannelProviderFactory from "../factory/providers/MultichannelProviderFactory.js";
import MultichannelPermissions from "../permissions/MultichannelPermissions.js";
import { CustomRequest } from "@drax/crud-back/src/controllers/AbstractFastifyController";

class MultichannelController {
    async sendWhatsappTemplate(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(MultichannelPermissions.SendWhatsappTemplate);

            const body = request.body as SendWhatsappTemplateParams;
            const result = await MultichannelProviderFactory.instance.sendWhatsappTemplate(body);

            return reply.status(200).send(result);
        } catch (error: any) {
            console.error(error);

            if (error instanceof MultichannelProviderError) {
                return reply.status(error.statusCode).send(
                    error.payload || {
                        status: {
                            code: 2,
                            message: error.message,
                        },
                    }
                );
            }

            return reply.status(500).send({
                error: "MULTICHANNEL_SEND_WHATSAPP_TEMPLATE_ERROR",
                message: error?.message || "Failed to send WhatsApp template message",
            });
        }
    }
}

export default MultichannelController;
export {
    MultichannelController
}
