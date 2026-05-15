
import BonusServiceFactory from "../factory/services/BonusServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import BonusPermissions from "../permissions/BonusPermissions.js";
import type {IBonus, IBonusBase} from "../interfaces/IBonus";
import type {FastifyReply} from "fastify";
import {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import type {BonusService} from "../services/BonusService.js";
import {BadRequestError, ForbiddenError, NotFoundError} from "@drax/common-back";

class BonusController extends AbstractFastifyController<IBonus, IBonusBase, IBonusBase>   {

    constructor() {
        super(BonusServiceFactory.instance, BonusPermissions)
        this.tenantField = "tenant";
        this.userField = "createdBy";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = true;
        this.userAssert = false;
    }

    get bonusService(): BonusService {
        return this.service as BonusService
    }

    preCreate(request: CustomRequest, payload: any) {
        payload.status = 'Pendiente'
        delete payload.observation
        return payload
    }

    async preUpdate(request: CustomRequest, payload: any) {
        const current = await this.getCurrentItem(request)
        this.assertEditable(request, current)
        this.validateObservation(payload.status ?? current.status, payload.observation ?? current.observation)
        return payload
    }

    async preUpdatePartial(request: CustomRequest, payload: any) {
        const current = await this.getCurrentItem(request)
        this.assertEditable(request, current)
        this.validateObservation(payload.status ?? current.status, payload.observation ?? current.observation)
        return payload
    }

    async exportExcel(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(BonusPermissions.Export)

            const query = request.query as Record<string, unknown>
            const from = typeof query.from === 'string' ? query.from : ''
            const to = typeof query.to === 'string' ? query.to : ''
            const operator = typeof query.operator === 'string' ? query.operator : undefined

            if (!from || !to) {
                throw new BadRequestError('from and to are required')
            }

            const exported = await this.bonusService.exportExcel(from, to, operator)

            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            reply.header('Content-Disposition', `attachment; filename="${exported.fileName}"`)

            return reply.send(exported.buffer)
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async export(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertPermission(BonusPermissions.Export)
        return super.export(request, reply)
    }

    private async getCurrentItem(request: CustomRequest) {
        const id = request.params.id

        if (!id) {
            throw new BadRequestError('id is required')
        }

        const current = await this.bonusService.findById(id)

        if (!current) {
            throw new NotFoundError()
        }

        return current
    }

    private assertEditable(request: CustomRequest, item: IBonus) {
        if (request.rbac.hasPermission(BonusPermissions.Manage)) {
            return
        }

        const userId = request.rbac.userId ?? request.rbac.getAuthUser?.id
        const createdBy = this.resolveUserId(item.createdBy)

        if (!userId || !createdBy || userId !== createdBy || !this.isToday(item.createdAt)) {
            throw new ForbiddenError()
        }
    }

    private validateObservation(status: string, observation?: string) {
        if (status === 'No aplicado' && !observation?.trim()) {
            throw new BadRequestError('observation is required when status is No aplicado')
        }
    }

    private resolveUserId(user: any) {
        if (!user) {
            return ''
        }

        if (typeof user === 'string') {
            return user
        }

        return user._id?.toString() ?? user.id?.toString() ?? ''
    }

    private isToday(value?: Date) {
        if (!value) {
            return false
        }

        const date = new Date(value)
        const today = new Date()

        return date.getFullYear() === today.getFullYear()
            && date.getMonth() === today.getMonth()
            && date.getDate() === today.getDate()
    }

}

export default BonusController;
export {
    BonusController
}
