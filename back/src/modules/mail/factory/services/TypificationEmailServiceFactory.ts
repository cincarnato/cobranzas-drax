
import TypificationEmailMongoRepository from '../../repository/mongo/TypificationEmailMongoRepository.js'
import TypificationEmailSqliteRepository from '../../repository/sqlite/TypificationEmailSqliteRepository.js'
import type {ITypificationEmailRepository} from "../../interfaces/ITypificationEmailRepository";
import {TypificationEmailService} from '../../services/TypificationEmailService.js'
import {TypificationEmailBaseSchema, TypificationEmailSchema} from "../../schemas/TypificationEmailSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TypificationEmailServiceFactory {
    private static service: TypificationEmailService;

    public static get instance(): TypificationEmailService {
        if (!TypificationEmailServiceFactory.service) {
            
            let repository: ITypificationEmailRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TypificationEmailMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TypificationEmailSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = TypificationEmailBaseSchema;
            const fullSchema = TypificationEmailSchema;
            TypificationEmailServiceFactory.service = new TypificationEmailService(repository, baseSchema, fullSchema);
        }
        return TypificationEmailServiceFactory.service;
    }
}

export default TypificationEmailServiceFactory
export {
    TypificationEmailServiceFactory
}

