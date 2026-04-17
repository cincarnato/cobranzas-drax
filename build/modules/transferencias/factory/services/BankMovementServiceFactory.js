import BankMovementMongoRepository from '../../repository/mongo/BankMovementMongoRepository.js';
import BankMovementSqliteRepository from '../../repository/sqlite/BankMovementSqliteRepository.js';
import { BankMovementService } from '../../services/BankMovementService.js';
import { BankMovementBaseSchema, BankMovementSchema } from "../../schemas/BankMovementSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class BankMovementServiceFactory {
    static get instance() {
        if (!BankMovementServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new BankMovementMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new BankMovementSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const baseSchema = BankMovementBaseSchema;
            const fullSchema = BankMovementSchema;
            BankMovementServiceFactory.service = new BankMovementService(repository, baseSchema, fullSchema);
        }
        return BankMovementServiceFactory.service;
    }
}
export default BankMovementServiceFactory;
export { BankMovementServiceFactory };
