import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import TransferEmailPermissions from "../permissions/TransferEmailPermissions.js";
import InboundMailTransferProcessor from "../processors/InboundMailTransferProcessor.js";
class TransferEmailController extends AbstractFastifyController {
    constructor() {
        super(TransferEmailServiceFactory.instance, TransferEmailPermissions);
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
        this.inboundMailTransferProcessor = new InboundMailTransferProcessor();
    }
    async processInboundEmails(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(TransferEmailPermissions.Manage);
            const result = await this.inboundMailTransferProcessor.processInboundEmails();
            return reply.status(200).send(result);
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send({
                error: "TRANSFER_EMAIL_PROCESS_ERROR",
                message: error?.message || "Failed to process inbound transfer emails",
            });
        }
    }
}
export default TransferEmailController;
export { TransferEmailController };
