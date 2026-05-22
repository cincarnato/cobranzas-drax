import CallAttemptMongoRepository from '../../repository/mongo/CallAttemptMongoRepository.js'
import CallAttemptSqliteRepository from '../../repository/sqlite/CallAttemptSqliteRepository.js'
import type {ICallAttemptRepository} from "../../interfaces/ICallAttemptRepository";
import {CallAttemptService} from '../../services/CallAttemptService.js'
import {CallAttemptBaseSchema, CallAttemptSchema} from "../../schemas/CallAttemptSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class CallAttemptServiceFactory {
    private static service: CallAttemptService;

    public static get instance(): CallAttemptService {
        if (!CallAttemptServiceFactory.service) {

            let repository: ICallAttemptRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CallAttemptMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new CallAttemptSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            const baseSchema = CallAttemptBaseSchema;
            const fullSchema = CallAttemptSchema;
            CallAttemptServiceFactory.service = new CallAttemptService(repository, baseSchema, fullSchema);
        }
        return CallAttemptServiceFactory.service;
    }
}

export default CallAttemptServiceFactory
export {
    CallAttemptServiceFactory
}
