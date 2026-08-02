
import MailboxUserSettingMongoRepository from '../../repository/mongo/MailboxUserSettingMongoRepository.js'
import MailboxUserSettingSqliteRepository from '../../repository/sqlite/MailboxUserSettingSqliteRepository.js'
import type {IMailboxUserSettingRepository} from "../../interfaces/IMailboxUserSettingRepository";
import {MailboxUserSettingService} from '../../services/MailboxUserSettingService.js'
import {MailboxUserSettingBaseSchema, MailboxUserSettingSchema} from "../../schemas/MailboxUserSettingSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class MailboxUserSettingServiceFactory {
    private static service: MailboxUserSettingService;

    public static get instance(): MailboxUserSettingService {
        if (!MailboxUserSettingServiceFactory.service) {
            
            let repository: IMailboxUserSettingRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new MailboxUserSettingMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new MailboxUserSettingSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = MailboxUserSettingBaseSchema;
            const fullSchema = MailboxUserSettingSchema;
            MailboxUserSettingServiceFactory.service = new MailboxUserSettingService(repository, baseSchema, fullSchema);
        }
        return MailboxUserSettingServiceFactory.service;
    }
}

export default MailboxUserSettingServiceFactory
export {
    MailboxUserSettingServiceFactory
}

