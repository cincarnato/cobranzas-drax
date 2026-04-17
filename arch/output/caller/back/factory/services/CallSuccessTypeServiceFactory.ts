
import CallSuccessTypeMongoRepository from '../../repository/mongo/CallSuccessTypeMongoRepository.js'
import CallSuccessTypeSqliteRepository from '../../repository/sqlite/CallSuccessTypeSqliteRepository.js'
import type {ICallSuccessTypeRepository} from "../../interfaces/ICallSuccessTypeRepository";
import {CallSuccessTypeService} from '../../services/CallSuccessTypeService.js'
import {CallSuccessTypeBaseSchema, CallSuccessTypeSchema} from "../../schemas/CallSuccessTypeSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class CallSuccessTypeServiceFactory {
    private static service: CallSuccessTypeService;

    public static get instance(): CallSuccessTypeService {
        if (!CallSuccessTypeServiceFactory.service) {
            
            let repository: ICallSuccessTypeRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CallSuccessTypeMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new CallSuccessTypeSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = CallSuccessTypeBaseSchema;
            const fullSchema = CallSuccessTypeSchema;
            CallSuccessTypeServiceFactory.service = new CallSuccessTypeService(repository, baseSchema, fullSchema);
        }
        return CallSuccessTypeServiceFactory.service;
    }
}

export default CallSuccessTypeServiceFactory
export {
    CallSuccessTypeServiceFactory
}

