import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import type {IEmailUserStateRepository} from "../interfaces/IEmailUserStateRepository";
import type {IEmailUserState, IEmailUserStateBase} from "../interfaces/IEmailUserState";

class EmailUserStateService extends AbstractService<IEmailUserState, IEmailUserStateBase, IEmailUserStateBase> {
    private repository: IEmailUserStateRepository;

    constructor(repository: IEmailUserStateRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(repository, baseSchema, fullSchema);
        this.repository = repository;
        this._validateOutput = true;
    }

    async findByEmailAndUser(inboundEmailId: string, userId: string) {
        return await this.repository.findByEmailAndUser(inboundEmailId, userId);
    }

    async upsertState(inboundEmailId: string, userId: string, data: Partial<IEmailUserStateBase>) {
        return await this.repository.upsertState(inboundEmailId, userId, data);
    }

    async findStarredEmailIds(userId: string) {
        return await this.repository.findStarredEmailIds(userId);
    }
}

export default EmailUserStateService
export {EmailUserStateService}
