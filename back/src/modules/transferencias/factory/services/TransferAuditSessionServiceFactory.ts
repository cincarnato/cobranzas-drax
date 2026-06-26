import TransferAuditSessionMongoRepository from "../../repository/mongo/TransferAuditSessionMongoRepository.js";
import TransferAuditSessionSqliteRepository from "../../repository/sqlite/TransferAuditSessionSqliteRepository.js";
import type {ITransferAuditSessionRepository} from "../../interfaces/ITransferAuditSessionRepository";
import {TransferAuditSessionService} from "../../services/TransferAuditSessionService.js";
import {TransferAuditSessionBaseSchema, TransferAuditSessionSchema} from "../../schemas/TransferAuditSessionSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TransferAuditSessionServiceFactory {
    private static service: TransferAuditSessionService;

    public static get instance(): TransferAuditSessionService {
        if (!TransferAuditSessionServiceFactory.service) {
            let repository: ITransferAuditSessionRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TransferAuditSessionMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TransferAuditSessionSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            TransferAuditSessionServiceFactory.service = new TransferAuditSessionService(
                repository,
                TransferAuditSessionBaseSchema,
                TransferAuditSessionSchema
            );
        }
        return TransferAuditSessionServiceFactory.service;
    }
}

export default TransferAuditSessionServiceFactory
export {TransferAuditSessionServiceFactory}
