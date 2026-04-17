import MailboxMongoRepository from '../../repository/mongo/MailboxMongoRepository.js';
import MailboxSqliteRepository from '../../repository/sqlite/MailboxSqliteRepository.js';
import { MailboxService } from '../../services/MailboxService.js';
import { MailboxBaseSchema, MailboxSchema } from "../../schemas/MailboxSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class MailboxServiceFactory {
    static get instance() {
        if (!MailboxServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new MailboxMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new MailboxSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const baseSchema = MailboxBaseSchema;
            const fullSchema = MailboxSchema;
            MailboxServiceFactory.service = new MailboxService(repository, baseSchema, fullSchema);
        }
        return MailboxServiceFactory.service;
    }
}
export default MailboxServiceFactory;
export { MailboxServiceFactory };
