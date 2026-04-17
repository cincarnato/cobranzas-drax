import GroupZoneMongoRepository from '../../repository/mongo/GroupZoneMongoRepository.js';
import GroupZoneSqliteRepository from '../../repository/sqlite/GroupZoneSqliteRepository.js';
import { GroupZoneService } from '../../services/GroupZoneService.js';
import { GroupZoneBaseSchema, GroupZoneSchema } from "../../schemas/GroupZoneSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class GroupZoneServiceFactory {
    static get instance() {
        if (!GroupZoneServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new GroupZoneMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new GroupZoneSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const baseSchema = GroupZoneBaseSchema;
            const fullSchema = GroupZoneSchema;
            GroupZoneServiceFactory.service = new GroupZoneService(repository, baseSchema, fullSchema);
        }
        return GroupZoneServiceFactory.service;
    }
}
export default GroupZoneServiceFactory;
export { GroupZoneServiceFactory };
