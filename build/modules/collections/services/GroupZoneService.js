import { AbstractService } from "@drax/crud-back";
class GroupZoneService extends AbstractService {
    constructor(GroupZoneRepository, baseSchema, fullSchema) {
        super(GroupZoneRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default GroupZoneService;
export { GroupZoneService };
