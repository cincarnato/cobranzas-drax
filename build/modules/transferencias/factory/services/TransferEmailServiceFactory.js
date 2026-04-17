import TransferEmailMongoRepository from '../../repository/mongo/TransferEmailMongoRepository.js';
import TransferEmailSqliteRepository from '../../repository/sqlite/TransferEmailSqliteRepository.js';
import { TransferEmailService } from '../../services/TransferEmailService.js';
import { TransferEmailBaseSchema, TransferEmailSchema } from "../../schemas/TransferEmailSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class TransferEmailServiceFactory {
    static get instance() {
        if (!TransferEmailServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TransferEmailMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new TransferEmailSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const baseSchema = TransferEmailBaseSchema;
            const fullSchema = TransferEmailSchema;
            TransferEmailServiceFactory.service = new TransferEmailService(repository, baseSchema, fullSchema);
        }
        return TransferEmailServiceFactory.service;
    }
}
export default TransferEmailServiceFactory;
export { TransferEmailServiceFactory };
