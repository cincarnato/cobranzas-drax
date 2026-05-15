
import WhatsappMessageMongoRepository from '../../repository/mongo/WhatsappMessageMongoRepository.js'
import WhatsappMessageSqliteRepository from '../../repository/sqlite/WhatsappMessageSqliteRepository.js'
import type {IWhatsappMessageRepository} from "../../interfaces/IWhatsappMessageRepository";
import {WhatsappMessageService} from '../../services/WhatsappMessageService.js'
import {WhatsappMessageBaseSchema, WhatsappMessageSchema} from "../../schemas/WhatsappMessageSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class WhatsappMessageServiceFactory {
    private static service: WhatsappMessageService;

    public static get instance(): WhatsappMessageService {
        if (!WhatsappMessageServiceFactory.service) {
            
            let repository: IWhatsappMessageRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new WhatsappMessageMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new WhatsappMessageSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = WhatsappMessageBaseSchema;
            const fullSchema = WhatsappMessageSchema;
            WhatsappMessageServiceFactory.service = new WhatsappMessageService(repository, baseSchema, fullSchema);
        }
        return WhatsappMessageServiceFactory.service;
    }
}

export default WhatsappMessageServiceFactory
export {
    WhatsappMessageServiceFactory
}

