
import AffiliateMongoRepository from '../../repository/mongo/AffiliateMongoRepository.js'
import AffiliateSqliteRepository from '../../repository/sqlite/AffiliateSqliteRepository.js'
import type {IAffiliateRepository} from "../../interfaces/IAffiliateRepository";
import {AffiliateService} from '../../services/AffiliateService.js'
import {AffiliateBaseSchema, AffiliateSchema} from "../../schemas/AffiliateSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class AffiliateServiceFactory {
    private static service: AffiliateService;

    public static get instance(): AffiliateService {
        if (!AffiliateServiceFactory.service) {
            
            let repository: IAffiliateRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new AffiliateMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new AffiliateSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = AffiliateBaseSchema;
            const fullSchema = AffiliateSchema;
            AffiliateServiceFactory.service = new AffiliateService(repository, baseSchema, fullSchema);
        }
        return AffiliateServiceFactory.service;
    }
}

export default AffiliateServiceFactory
export {
    AffiliateServiceFactory
}

