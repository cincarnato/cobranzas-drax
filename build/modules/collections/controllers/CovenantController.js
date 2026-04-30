import CovenantServiceFactory from "../factory/services/CovenantServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import CovenantPermissions from "../permissions/CovenantPermissions.js";
import { BadRequestError } from "@drax/common-back";
class CovenantController extends AbstractFastifyController {
    constructor() {
        super(CovenantServiceFactory.instance, CovenantPermissions);
        this.tenantField = "tenant";
        this.userField = "createdBy";
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        this.userFilter = false;
        this.userSetter = true;
        this.userAssert = false;
    }
    preCreate(request, payload) {
        payload.updatedBy = request.rbac.getAuthUser.id;
        return payload;
    }
    preUpdate(request, payload) {
        payload.updatedBy = request.rbac.getAuthUser.id;
        return payload;
    }
    async exportExcel(request, reply) {
        try {
            request.rbac.assertPermission(this.permission.View);
            const query = request.query;
            const date = typeof query.date === 'string' ? query.date : '';
            const group = typeof query.group === 'string' ? query.group : '';
            if (!date || !group) {
                throw new BadRequestError('date and group are required');
            }
            const exported = await CovenantServiceFactory.instance.exportExcel(date, group);
            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            reply.header('Content-Disposition', `attachment; filename="${exported.fileName}"`);
            return reply.send(exported.buffer);
        }
        catch (e) {
            this.handleError(e, reply);
        }
    }
}
export default CovenantController;
export { CovenantController };
