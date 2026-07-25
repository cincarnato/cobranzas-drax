
import {AbstractMongoRepository} from "@drax/crud-back";
import {SessionEmailModel} from "../../models/SessionEmailModel.js";
import type {ISessionEmailRepository} from '../../interfaces/ISessionEmailRepository'
import type {ISessionEmail, ISessionEmailBase} from "../../interfaces/ISessionEmail";


class SessionEmailMongoRepository extends AbstractMongoRepository<ISessionEmail, ISessionEmailBase, ISessionEmailBase> implements ISessionEmailRepository {

    constructor() {
        super();
        this._model = SessionEmailModel;
        this._searchFields = [];
        this._populateFields = ['mailbox', 'user'];
        this._lean = true
    }

}

export default SessionEmailMongoRepository
export {SessionEmailMongoRepository}

