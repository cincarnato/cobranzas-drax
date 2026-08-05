
import TemplateEmailMongoRepository from '../../repository/mongo/TemplateEmailMongoRepository.js'
import TemplateEmailSqliteRepository from '../../repository/sqlite/TemplateEmailSqliteRepository.js'
import type {ITemplateEmailRepository} from "../../interfaces/ITemplateEmailRepository";
import {TemplateEmailService} from '../../services/TemplateEmailService.js'
import {TemplateEmailBaseSchema, TemplateEmailSchema} from "../../schemas/TemplateEmailSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TemplateEmailServiceFactory {
    private static service: TemplateEmailService;

    public static get instance(): TemplateEmailService {
        if (!TemplateEmailServiceFactory.service) {
            
            let repository: ITemplateEmailRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TemplateEmailMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TemplateEmailSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = TemplateEmailBaseSchema;
            const fullSchema = TemplateEmailSchema;
            TemplateEmailServiceFactory.service = new TemplateEmailService(repository, baseSchema, fullSchema);
        }
        return TemplateEmailServiceFactory.service;
    }
}

export default TemplateEmailServiceFactory
export {
    TemplateEmailServiceFactory
}

