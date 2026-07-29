import InternalTransferBonusServiceFactory from "../factory/services/InternalTransferBonusServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import InternalTransferBonusPermissions from "../permissions/InternalTransferBonusPermissions.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "@drax/common-back";
class InternalTransferBonusController extends AbstractFastifyController {
    constructor() {
        super(InternalTransferBonusServiceFactory.instance, InternalTransferBonusPermissions);
        this.tenantField = "tenant";
        this.userField = "createdBy";
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        this.userFilter = false;
        this.userSetter = true;
        this.userAssert = false;
    }
    get internalTransferBonusService() {
        return this.service;
    }
    preCreate(request, payload) {
        payload.status = 'Pendiente';
        delete payload.observation;
        this.validateBankDataAttachment(payload.bonusType, payload.bankDataAttachment);
        return payload;
    }
    async preUpdate(request, payload) {
        const current = await this.getCurrentItem(request);
        this.assertEditable(request, current);
        this.validateObservation(payload.status ?? current.status, payload.observation ?? current.observation);
        this.validateBankDataAttachment(payload.bonusType ?? current.bonusType, payload.bankDataAttachment ?? current.bankDataAttachment);
        return payload;
    }
    async preUpdatePartial(request, payload) {
        const current = await this.getCurrentItem(request);
        this.assertEditable(request, current);
        this.validateObservation(payload.status ?? current.status, payload.observation ?? current.observation);
        this.validateBankDataAttachment(payload.bonusType ?? current.bonusType, payload.bankDataAttachment ?? current.bankDataAttachment);
        return payload;
    }
    async exportExcel(request, reply) {
        try {
            request.rbac.assertPermission(InternalTransferBonusPermissions.Export);
            const query = request.query;
            const from = typeof query.from === 'string' ? query.from : '';
            const to = typeof query.to === 'string' ? query.to : '';
            const operator = typeof query.operator === 'string' ? query.operator : undefined;
            if (!from || !to) {
                throw new BadRequestError('from and to are required');
            }
            const exported = await this.internalTransferBonusService.exportExcel(from, to, operator);
            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            reply.header('Content-Disposition', `attachment; filename="${exported.fileName}"`);
            return reply.send(exported.buffer);
        }
        catch (e) {
            this.handleError(e, reply);
        }
    }
    async export(request, reply) {
        request.rbac.assertPermission(InternalTransferBonusPermissions.Export);
        return super.export(request, reply);
    }
    async getCurrentItem(request) {
        const id = request.params.id;
        if (!id) {
            throw new BadRequestError('id is required');
        }
        const current = await this.internalTransferBonusService.findById(id);
        if (!current) {
            throw new NotFoundError();
        }
        return current;
    }
    assertEditable(request, item) {
        if (request.rbac.hasPermission(InternalTransferBonusPermissions.Manage)) {
            return;
        }
        const userId = request.rbac.userId ?? request.rbac.getAuthUser?.id;
        const createdBy = this.resolveUserId(item.createdBy);
        if (!userId || !createdBy || userId !== createdBy || !this.isToday(item.createdAt)) {
            throw new ForbiddenError();
        }
    }
    validateObservation(status, observation) {
        if (status === 'No aplicado' && !observation?.trim()) {
            throw new BadRequestError('observation is required when status is No aplicado');
        }
    }
    validateBankDataAttachment(bonusType, bankDataAttachment) {
        if (bonusType === 'Transferencia Bancaria' && !bankDataAttachment?.url && !bankDataAttachment?.filepath) {
            throw new BadRequestError('bankDataAttachment is required when bonusType is Transferencia Bancaria');
        }
    }
    resolveUserId(user) {
        if (!user) {
            return '';
        }
        if (typeof user === 'string') {
            return user;
        }
        return user._id?.toString() ?? user.id?.toString() ?? '';
    }
    isToday(value) {
        if (!value) {
            return false;
        }
        const date = new Date(value);
        const today = new Date();
        return date.getFullYear() === today.getFullYear()
            && date.getMonth() === today.getMonth()
            && date.getDate() === today.getDate();
    }
}
export default InternalTransferBonusController;
export { InternalTransferBonusController };
