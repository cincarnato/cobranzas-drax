import InternalTransferBonusMongoRepository from '../../repository/mongo/InternalTransferBonusMongoRepository.js';
import InternalTransferBonusSqliteRepository from '../../repository/sqlite/InternalTransferBonusSqliteRepository.js';
import { InternalTransferBonusService } from '../../services/InternalTransferBonusService.js';
import { InternalTransferBonusBaseSchema, InternalTransferBonusSchema } from "../../schemas/InternalTransferBonusSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class InternalTransferBonusServiceFactory {
    static get instance() {
        if (!InternalTransferBonusServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new InternalTransferBonusMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new InternalTransferBonusSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const baseSchema = InternalTransferBonusBaseSchema;
            const fullSchema = InternalTransferBonusSchema;
            InternalTransferBonusServiceFactory.service = new InternalTransferBonusService(repository, baseSchema, fullSchema);
        }
        return InternalTransferBonusServiceFactory.service;
    }
}
export default InternalTransferBonusServiceFactory;
export { InternalTransferBonusServiceFactory };
