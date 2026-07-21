
import OutboundEmailMongoRepository from '../../repository/mongo/OutboundEmailMongoRepository.js'
import OutboundEmailSqliteRepository from '../../repository/sqlite/OutboundEmailSqliteRepository.js'
import type {IOutboundEmailRepository} from "../../interfaces/IOutboundEmailRepository";
import {OutboundEmailService} from '../../services/OutboundEmailService.js'
import {OutboundEmailBaseSchema, OutboundEmailSchema} from "../../schemas/OutboundEmailSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class OutboundEmailServiceFactory {
    private static service: OutboundEmailService;

    public static get instance(): OutboundEmailService {
        if (!OutboundEmailServiceFactory.service) {
            
            let repository: IOutboundEmailRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new OutboundEmailMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new OutboundEmailSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = OutboundEmailBaseSchema;
            const fullSchema = OutboundEmailSchema;
            OutboundEmailServiceFactory.service = new OutboundEmailService(repository, baseSchema, fullSchema);
        }
        return OutboundEmailServiceFactory.service;
    }
}

export default OutboundEmailServiceFactory
export {
    OutboundEmailServiceFactory
}

