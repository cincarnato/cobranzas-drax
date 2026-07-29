import { AbstractService } from "@drax/crud-back";
class EmailUserStateService extends AbstractService {
    constructor(repository, baseSchema, fullSchema) {
        super(repository, baseSchema, fullSchema);
        this.repository = repository;
        this._validateOutput = true;
    }
    async findByEmailAndUser(inboundEmailId, userId) {
        return await this.repository.findByEmailAndUser(inboundEmailId, userId);
    }
    async upsertState(inboundEmailId, userId, data) {
        return await this.repository.upsertState(inboundEmailId, userId, data);
    }
    async findStarredEmailIds(userId) {
        return await this.repository.findStarredEmailIds(userId);
    }
}
export default EmailUserStateService;
export { EmailUserStateService };
