import SessionEmailMongoRepository from '../../repository/mongo/SessionEmailMongoRepository.js'
import SessionEmailSqliteRepository from '../../repository/sqlite/SessionEmailSqliteRepository.js'
import type {ISessionEmailRepository} from "../../interfaces/ISessionEmailRepository";
import {SessionEmailService} from '../../services/SessionEmailService.js'
import {SessionEmailBaseSchema, SessionEmailSchema} from "../../schemas/SessionEmailSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class SessionEmailServiceFactory {
    private static service: SessionEmailService;

    public static get instance(): SessionEmailService {
        if (!SessionEmailServiceFactory.service) {
            let repository: ISessionEmailRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new SessionEmailMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new SessionEmailSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            SessionEmailServiceFactory.service = new SessionEmailService(repository, SessionEmailBaseSchema, SessionEmailSchema);
        }
        return SessionEmailServiceFactory.service;
    }
}

export default SessionEmailServiceFactory
export {SessionEmailServiceFactory}
