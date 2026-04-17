import CallFailedTypeMongoRepository from '../../repository/mongo/CallFailedTypeMongoRepository.js';
import CallFailedTypeSqliteRepository from '../../repository/sqlite/CallFailedTypeSqliteRepository.js';
import { CallFailedTypeService } from '../../services/CallFailedTypeService.js';
import { CallFailedTypeBaseSchema, CallFailedTypeSchema } from "../../schemas/CallFailedTypeSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class CallFailedTypeServiceFactory {
    static get instance() {
        if (!CallFailedTypeServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CallFailedTypeMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new CallFailedTypeSqliteRepository(dbFile, false);
                    repository.build();
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
export default CallFailedTypeServiceFactory;
export { CallFailedTypeServiceFactory };
