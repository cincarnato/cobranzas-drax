
import PayerEntityMongoRepository from '../../repository/mongo/PayerEntityMongoRepository.js'
import PayerEntitySqliteRepository from '../../repository/sqlite/PayerEntitySqliteRepository.js'
import type {IPayerEntityRepository} from "../../interfaces/IPayerEntityRepository";
import {PayerEntityService} from '../../services/PayerEntityService.js'
import {PayerEntityBaseSchema, PayerEntitySchema} from "../../schemas/PayerEntitySchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class PayerEntityServiceFactory {
    private static service: PayerEntityService;

    public static get instance(): PayerEntityService {
        if (!PayerEntityServiceFactory.service) {
            
            let repository: IPayerEntityRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new PayerEntityMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new PayerEntitySqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = PayerEntityBaseSchema;
            const fullSchema = PayerEntitySchema;
            PayerEntityServiceFactory.service = new PayerEntityService(repository, baseSchema, fullSchema);
        }
        return PayerEntityServiceFactory.service;
    }
}

export default PayerEntityServiceFactory
export {
    PayerEntityServiceFactory
}

