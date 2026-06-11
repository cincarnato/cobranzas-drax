
import PayerMongoRepository from '../../repository/mongo/PayerMongoRepository.js'
import PayerSqliteRepository from '../../repository/sqlite/PayerSqliteRepository.js'
import type {IPayerRepository} from "../../interfaces/IPayerRepository";
import {PayerService} from '../../services/PayerService.js'
import {PayerBaseSchema, PayerSchema} from "../../schemas/PayerSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class PayerServiceFactory {
    private static service: PayerService;

    public static get instance(): PayerService {
        if (!PayerServiceFactory.service) {
            
            let repository: IPayerRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new PayerMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new PayerSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = PayerBaseSchema;
            const fullSchema = PayerSchema;
            PayerServiceFactory.service = new PayerService(repository, baseSchema, fullSchema);
        }
        return PayerServiceFactory.service;
    }
}

export default PayerServiceFactory
export {
    PayerServiceFactory
}

