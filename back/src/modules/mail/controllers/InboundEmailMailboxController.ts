import type {FastifyReply} from "fastify";
import {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import InboundEmailMailboxProvider from "../providers/InboundEmailMailboxProvider.js";

class InboundEmailMailboxController {
    private provider = InboundEmailMailboxProvider.instance;

    async sync(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission("mailbox:manage");

            const result = await this.provider.syncAllEnabledMailboxes();
            return reply.status(200).send(result);
        } catch (error: any) {
            return reply.status(500).send({
                error: "INBOUND_EMAIL_SYNC_ERROR",
                message: error?.message || "Failed to sync inbound emails",
            });
        }
    }
}

export default InboundEmailMailboxController;
export {InboundEmailMailboxController};
