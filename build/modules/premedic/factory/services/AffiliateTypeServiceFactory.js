import AffiliateTypeMongoRepository from '../../repository/mongo/AffiliateTypeMongoRepository.js';
import AffiliateTypeSqliteRepository from '../../repository/sqlite/AffiliateTypeSqliteRepository.js';
import { AffiliateTypeService } from '../../services/AffiliateTypeService.js';
import { AffiliateTypeBaseSchema, AffiliateTypeSchema } from "../../schemas/AffiliateTypeSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class AffiliateTypeServiceFactory {
    static get instance() {
        if (!AffiliateTypeServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new AffiliateTypeMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new AffiliateTypeSqliteRepository(dbFile, false);
                    repository.build();
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
export default AffiliateTypeServiceFactory;
export { AffiliateTypeServiceFactory };
