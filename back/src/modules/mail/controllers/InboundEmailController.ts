
import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";
import type {IInboundEmail, IInboundEmailBase} from "../interfaces/IInboundEmail";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {z} from "zod";
import EmailUserStateServiceFactory from "../factory/services/EmailUserStateServiceFactory.js";
import {ForbiddenError} from "@drax/common-back";

const ClassificationSchema = z.object({
    category: z.string().nullable().optional(),
    closeReason: z.string().nullable().optional(),
    priority: z.string().nullable().optional(),
    sentiment: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
});

const AssignmentSchema = z.object({
    assignedTo: z.string().nullable().optional(),
});

const AssignToMeSchema = z.object({
    force: z.boolean().optional(),
});

const CloseManagementSchema = z.object({
    closeReason: z.string().nullable().optional(),
});

const UserStateSchema = z.object({
    isRead: z.boolean().optional(),
    isStarred: z.boolean().optional(),
});

class InboundEmailController extends AbstractFastifyController<IInboundEmail, IInboundEmailBase, IInboundEmailBase>   {

    constructor() {
        super(InboundEmailServiceFactory.instance, InboundEmailPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

    async managementPaginate(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(InboundEmailPermissions.View);
            const query = request.query as Record<string, any>;
            const userId = request.rbac.userId;
            const isSupervisor = request.rbac.hasPermission(InboundEmailPermissions.Manage);
            const view = query.view || "PENDING";
            const assignedTo = view === "ASSIGNED_TO_ME" || view === "ASSIGNED_IN_ATTENTION"
                ? userId
                : (!isSupervisor && view === "ASSIGNED" ? userId : query.assignedTo);
            const attentionStatus = this.resolveAttentionStatus(view, query.attentionStatus);
            const assignmentMode = this.resolveAssignmentMode(view, query.assignmentMode);

            const result = await InboundEmailServiceFactory.instance.managementPaginate({
                mailboxValues: query.mailboxId ? [query.mailboxId] : undefined,
                attentionStatus,
                assignedTo,
                assignmentMode,
                category: query.category,
                priorities: this.arrayQuery(query.priorities || query.priority),
                tags: this.arrayQuery(query.tags),
                hasAttachments: this.booleanQuery(query.hasAttachments),
                withoutReply: this.booleanQuery(query.withoutReply),
                dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
                dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
                search: query.search,
                page: Number(query.page || 1),
                pageSize: Number(query.pageSize || query.limit || 25),
                sortBy: query.sortBy || "receivedAt",
                sortDirection: query.sortDirection === "asc" ? "asc" : "desc",
                currentUserId: userId,
                starredOnly: view === "STARRED",
            });
            return reply.send(result);
        } catch (error) {
            throw error;
        }
    }

    async managementDetail(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.View);
        const {id} = request.params as {id: string};
        const result = await InboundEmailServiceFactory.instance.managementDetail(id, request.rbac.userId);
        return reply.send(result);
    }

    async assignToMe(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated();
            this.assertPermissionOrManage(request, InboundEmailPermissions.AssignToMe);
            const {id} = request.params as {id: string};
            const payload = AssignToMeSchema.parse(request.body || {});
            return reply.send(await InboundEmailServiceFactory.instance.assignToMe(id, request.rbac.userId, Boolean(payload.force)));
        } catch (error: any) {
            if (error?.message === "INBOUND_EMAIL_ASSIGNMENT_CONFLICT") {
                return reply.status(409).send({error: error.message, message: "Este correo acaba de ser asignado a otro operador."});
            }
            throw error;
        }
    }

    async reassign(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        this.assertPermissionOrManage(request, InboundEmailPermissions.Assign);
        const {id} = request.params as {id: string};
        const payload = AssignmentSchema.parse(request.body || {});
        return reply.send(await InboundEmailServiceFactory.instance.reassign(id, payload.assignedTo || null, request.rbac.userId));
    }

    async updateClassification(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.Update);
        const {id} = request.params as {id: string};
        const current = await InboundEmailServiceFactory.instance.findById(id);
        InboundEmailServiceFactory.instance.assertCanOperate(current, request.rbac.userId, request.rbac.hasPermission(InboundEmailPermissions.Manage));
        const payload = ClassificationSchema.parse(request.body || {});
        return reply.send(await InboundEmailServiceFactory.instance.updateClassification(id, payload, request.rbac.userId));
    }

    async closeManagement(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.Update);
        const {id} = request.params as {id: string};
        const current = await InboundEmailServiceFactory.instance.findById(id);
        InboundEmailServiceFactory.instance.assertCanOperate(current, request.rbac.userId, false);
        const payload = CloseManagementSchema.parse(request.body || {});
        return reply.send(await InboundEmailServiceFactory.instance.closeManagement(id, request.rbac.userId, payload.closeReason || undefined));
    }

    async reopenAndAssignToMe(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        this.assertPermissionsOrManage(request, [InboundEmailPermissions.Reopen, InboundEmailPermissions.AssignToMe]);
        const {id} = request.params as {id: string};
        return reply.send(await InboundEmailServiceFactory.instance.reopenAndAssignToMe(id, request.rbac.userId));
    }

    async updateUserState(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.View);
        const {id} = request.params as {id: string};
        const payload = UserStateSchema.parse(request.body || {});
        await InboundEmailServiceFactory.instance.assertEmailMailboxOperator(id, request.rbac.userId);
        return reply.send(await EmailUserStateServiceFactory.instance.upsertState(id, request.rbac.userId, payload));
    }

    private resolveAttentionStatus(view?: string, fallback?: string) {
        if (view === "PENDING") return "PENDING";
        if (view === "ASSIGNED_TO_ME" || view === "ASSIGNED_IN_ATTENTION" || view === "ASSIGNED") return "ASSIGNED";
        if (view === "CLOSED") return "CLOSED";
        if (view === "ALL" || view === "STARRED") return undefined;
        return fallback;
    }

    private resolveAssignmentMode(view?: string, fallback?: string) {
        if (view === "ASSIGNED_IN_ATTENTION") return "AUTO";
        if (view === "ASSIGNED_TO_ME") return "MANUAL";
        return fallback === "AUTO" || fallback === "MANUAL" ? fallback : undefined;
    }

    private arrayQuery(value: any): string[] | undefined {
        if (!value) return undefined;
        if (Array.isArray(value)) return value.filter(Boolean);
        return String(value).split(",").map((item) => item.trim()).filter(Boolean);
    }

    private booleanQuery(value: any): boolean | undefined {
        if (value === undefined || value === null || value === "") return undefined;
        return value === true || value === "true" || value === "1";
    }

    private assertPermissionOrManage(request: CustomRequest, permission: InboundEmailPermissions) {
        if (request.rbac.hasPermission(permission) || request.rbac.hasPermission(InboundEmailPermissions.Manage)) return;
        throw new ForbiddenError();
    }

    private assertPermissionsOrManage(request: CustomRequest, permissions: InboundEmailPermissions[]) {
        if (request.rbac.hasPermission(InboundEmailPermissions.Manage)) return;
        if (permissions.every((permission) => request.rbac.hasPermission(permission))) return;
        throw new ForbiddenError();
    }

}

export default InboundEmailController;
export {
    InboundEmailController
}
