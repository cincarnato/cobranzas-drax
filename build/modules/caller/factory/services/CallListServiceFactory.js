import CallListMongoRepository from '../../repository/mongo/CallListMongoRepository.js';
import CallListSqliteRepository from '../../repository/sqlite/CallListSqliteRepository.js';
import { CallListService } from '../../services/CallListService.js';
import { CallListBaseSchema, CallListSchema } from "../../schemas/CallListSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class CallListServiceFactory {
    static get instance() {
        if (!CallListServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CallListMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new CallListSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const baseSchema = CallListBaseSchema;
            const fullSchema = CallListSchema;
            CallListServiceFactory.service = new CallListService(repository, baseSchema, fullSchema);
        }
        return CallListServiceFactory.service;
    }
}
export default CallListServiceFactory;
export { CallListServiceFactory };
