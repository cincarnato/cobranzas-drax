import { z } from "zod";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";
import EmailSupervisionServiceFactory from "../factory/services/EmailSupervisionServiceFactory.js";
const LiveQuerySchema = z.object({
    includeWithoutSession: z.union([z.boolean(), z.string()]).optional(),
});
class EmailSupervisionController {
    async live(request, reply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.Manage);
        const { mailboxId } = request.params;
        const query = LiveQuerySchema.parse(request.query || {});
        const includeWithoutSession = query.includeWithoutSession === true || query.includeWithoutSession === "true" || query.includeWithoutSession === "1";
        return reply.send(await EmailSupervisionServiceFactory.instance.live(mailboxId, includeWithoutSession));
    }
    async assignedEmails(request, reply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.Manage);
        const { mailboxId, userId } = request.params;
        return reply.send(await EmailSupervisionServiceFactory.instance.assignedEmails(mailboxId, userId));
    }
}
export default EmailSupervisionController;
export { EmailSupervisionController };
