
import CallFailedTypeMongoRepository from '../../repository/mongo/CallFailedTypeMongoRepository.js'
import CallFailedTypeSqliteRepository from '../../repository/sqlite/CallFailedTypeSqliteRepository.js'
import type {ICallFailedTypeRepository} from "../../interfaces/ICallFailedTypeRepository";
import {CallFailedTypeService} from '../../services/CallFailedTypeService.js'
import {CallFailedTypeBaseSchema, CallFailedTypeSchema} from "../../schemas/CallFailedTypeSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class CallFailedTypeServiceFactory {
    private static service: CallFailedTypeService;

    public static get instance(): CallFailedTypeService {
        if (!CallFailedTypeServiceFactory.service) {
            
            let repository: ICallFailedTypeRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CallFailedTypeMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new CallFailedTypeSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = CallFailedTypeBaseSchema;
            const fullSchema = CallFailedTypeSchema;
            CallFailedTypeServiceFactory.service = new CallFailedTypeService(repository, baseSchema, fullSchema);
        }
        return CallFailedTypeServiceFactory.service;
    }
}

export default CallFailedTypeServiceFactory
export {
    CallFailedTypeServiceFactory
}

