import InboundEmailMailboxProvider from "../providers/InboundEmailMailboxProvider.js";
class InboundEmailMailboxController {
    constructor() {
        this.provider = InboundEmailMailboxProvider.instance;
    }
    async sync(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission("mailbox:manage");
            const result = await this.provider.syncAllEnabledMailboxes();
            return reply.status(200).send(result);
        }
        catch (error) {
            return reply.status(500).send({
                error: "INBOUND_EMAIL_SYNC_ERROR",
                message: error?.message || "Failed to sync inbound emails",
            });
        }
    }
}
export default InboundEmailMailboxController;
export { InboundEmailMailboxController };
