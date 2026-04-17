import PadronMongoRepository from '../../repository/mongo/PadronMongoRepository.js';
import PadronSqliteRepository from '../../repository/sqlite/PadronSqliteRepository.js';
import { PadronService } from '../../services/PadronService.js';
import { PadronBaseSchema, PadronSchema } from "../../schemas/PadronSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class PadronServiceFactory {
    static get instance() {
        if (!PadronServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new PadronMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new PadronSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const baseSchema = PadronBaseSchema;
            const fullSchema = PadronSchema;
            PadronServiceFactory.service = new PadronService(repository, baseSchema, fullSchema);
        }
        return PadronServiceFactory.service;
    }
}
export default PadronServiceFactory;
export { PadronServiceFactory };
