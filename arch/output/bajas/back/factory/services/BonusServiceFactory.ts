
import BonusMongoRepository from '../../repository/mongo/BonusMongoRepository.js'
import BonusSqliteRepository from '../../repository/sqlite/BonusSqliteRepository.js'
import type {IBonusRepository} from "../../interfaces/IBonusRepository";
import {BonusService} from '../../services/BonusService.js'
import {BonusBaseSchema, BonusSchema} from "../../schemas/BonusSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class BonusServiceFactory {
    private static service: BonusService;

    public static get instance(): BonusService {
        if (!BonusServiceFactory.service) {
            
            let repository: IBonusRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new BonusMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new BonusSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = BonusBaseSchema;
            const fullSchema = BonusSchema;
            BonusServiceFactory.service = new BonusService(repository, baseSchema, fullSchema);
        }
        return BonusServiceFactory.service;
    }
}

export default BonusServiceFactory
export {
    BonusServiceFactory
}

