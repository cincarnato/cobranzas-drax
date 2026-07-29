import EmailUserStateMongoRepository from '../../repository/mongo/EmailUserStateMongoRepository.js';
import EmailUserStateSqliteRepository from '../../repository/sqlite/EmailUserStateSqliteRepository.js';
import { EmailUserStateService } from '../../services/EmailUserStateService.js';
import { EmailUserStateBaseSchema, EmailUserStateSchema } from "../../schemas/EmailUserStateSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class EmailUserStateServiceFactory {
    static get instance() {
        if (!EmailUserStateServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new EmailUserStateMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new EmailUserStateSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            EmailUserStateServiceFactory.service = new EmailUserStateService(repository, EmailUserStateBaseSchema, EmailUserStateSchema);
        }
        return EmailUserStateServiceFactory.service;
    }
}
export default EmailUserStateServiceFactory;
export { EmailUserStateServiceFactory };
