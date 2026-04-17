import CallLogMongoRepository from '../../repository/mongo/CallLogMongoRepository.js';
import CallLogSqliteRepository from '../../repository/sqlite/CallLogSqliteRepository.js';
import { CallLogService } from '../../services/CallLogService.js';
import { CallLogBaseSchema, CallLogSchema } from "../../schemas/CallLogSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class CallLogServiceFactory {
    static get instance() {
        if (!CallLogServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CallLogMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new CallLogSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const baseSchema = CallLogBaseSchema;
            const fullSchema = CallLogSchema;
            CallLogServiceFactory.service = new CallLogService(repository, baseSchema, fullSchema);
        }
        return CallLogServiceFactory.service;
    }
}
export default CallLogServiceFactory;
export { CallLogServiceFactory };
