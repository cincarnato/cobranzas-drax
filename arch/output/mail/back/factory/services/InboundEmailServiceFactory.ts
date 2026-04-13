
import InboundEmailMongoRepository from '../../repository/mongo/InboundEmailMongoRepository.js'
import InboundEmailSqliteRepository from '../../repository/sqlite/InboundEmailSqliteRepository.js'
import type {IInboundEmailRepository} from "../../interfaces/IInboundEmailRepository";
import {InboundEmailService} from '../../services/InboundEmailService.js'
import {InboundEmailBaseSchema, InboundEmailSchema} from "../../schemas/InboundEmailSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class InboundEmailServiceFactory {
    private static service: InboundEmailService;

    public static get instance(): InboundEmailService {
        if (!InboundEmailServiceFactory.service) {
            
            let repository: IInboundEmailRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new InboundEmailMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new InboundEmailSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = InboundEmailBaseSchema;
            const fullSchema = InboundEmailSchema;
            InboundEmailServiceFactory.service = new InboundEmailService(repository, baseSchema, fullSchema);
        }
        return InboundEmailServiceFactory.service;
    }
}

export default InboundEmailServiceFactory
export {
    InboundEmailServiceFactory
}

