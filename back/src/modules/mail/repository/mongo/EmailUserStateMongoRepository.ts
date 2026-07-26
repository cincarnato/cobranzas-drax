import {AbstractMongoRepository} from "@drax/crud-back";
import {EmailUserStateModel} from "../../models/EmailUserStateModel.js";
import type {IEmailUserStateRepository} from "../../interfaces/IEmailUserStateRepository";
import type {IEmailUserState, IEmailUserStateBase} from "../../interfaces/IEmailUserState";

class EmailUserStateMongoRepository extends AbstractMongoRepository<IEmailUserState, IEmailUserStateBase, IEmailUserStateBase> implements IEmailUserStateRepository {
    constructor() {
        super();
        this._model = EmailUserStateModel;
        this._searchFields = [];
        this._populateFields = [];
        this._lean = true;
    }

    async findByEmailAndUser(inboundEmailId: string, userId: string): Promise<IEmailUserState | null> {
        return await this._model.findOne({inboundEmail: inboundEmailId, user: userId}).lean(this._lean).exec() as IEmailUserState | null;
    }

    async upsertState(inboundEmailId: string, userId: string, data: Partial<IEmailUserStateBase>): Promise<IEmailUserState> {
        const payload = {...data};
        if (payload.isRead && !payload.readAt) {
            payload.readAt = new Date();
        }
        return await this._model.findOneAndUpdate(
            {inboundEmail: inboundEmailId, user: userId},
            {$set: payload, $setOnInsert: {inboundEmail: inboundEmailId, user: userId}},
            {new: true, upsert: true}
        ).lean(this._lean).exec() as IEmailUserState;
    }

    async findStarredEmailIds(userId: string): Promise<string[]> {
        const states = await this._model.find({user: userId, isStarred: true}).select("inboundEmail").lean(this._lean).exec() as IEmailUserState[];
        return states.map((state) => state.inboundEmail?.toString()).filter(Boolean);
    }
}

export default EmailUserStateMongoRepository
export {EmailUserStateMongoRepository}
