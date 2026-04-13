
import AffiliateTypeMongoRepository from '../../repository/mongo/AffiliateTypeMongoRepository.js'
import AffiliateTypeSqliteRepository from '../../repository/sqlite/AffiliateTypeSqliteRepository.js'
import type {IAffiliateTypeRepository} from "../../interfaces/IAffiliateTypeRepository";
import {AffiliateTypeService} from '../../services/AffiliateTypeService.js'
import {AffiliateTypeBaseSchema, AffiliateTypeSchema} from "../../schemas/AffiliateTypeSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class AffiliateTypeServiceFactory {
    private static service: AffiliateTypeService;

    public static get instance(): AffiliateTypeService {
        if (!AffiliateTypeServiceFactory.service) {
            
            let repository: IAffiliateTypeRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new AffiliateTypeMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new AffiliateTypeSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = AffiliateTypeBaseSchema;
            const fullSchema = AffiliateTypeSchema;
            AffiliateTypeServiceFactory.service = new AffiliateTypeService(repository, baseSchema, fullSchema);
        }
        return AffiliateTypeServiceFactory.service;
    }
}

export default AffiliateTypeServiceFactory
export {
    AffiliateTypeServiceFactory
}

