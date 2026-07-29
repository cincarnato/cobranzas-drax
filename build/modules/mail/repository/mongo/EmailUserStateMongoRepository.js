import { AbstractMongoRepository } from "@drax/crud-back";
import { EmailUserStateModel } from "../../models/EmailUserStateModel.js";
class EmailUserStateMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = EmailUserStateModel;
        this._searchFields = [];
        this._populateFields = [];
        this._lean = true;
    }
    async findByEmailAndUser(inboundEmailId, userId) {
        return await this._model.findOne({ inboundEmail: inboundEmailId, user: userId }).lean(this._lean).exec();
    }
    async upsertState(inboundEmailId, userId, data) {
        const payload = { ...data };
        if (payload.isRead && !payload.readAt) {
            payload.readAt = new Date();
        }
        return await this._model.findOneAndUpdate({ inboundEmail: inboundEmailId, user: userId }, { $set: payload, $setOnInsert: { inboundEmail: inboundEmailId, user: userId } }, { new: true, upsert: true }).lean(this._lean).exec();
    }
    async findStarredEmailIds(userId) {
        const states = await this._model.find({ user: userId, isStarred: true }).select("inboundEmail").lean(this._lean).exec();
        return states.map((state) => state.inboundEmail?.toString()).filter(Boolean);
    }
}
export default EmailUserStateMongoRepository;
export { EmailUserStateMongoRepository };
