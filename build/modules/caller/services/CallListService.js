import { AbstractService } from "@drax/crud-back";
import CallFileProcessor from "../processors/CallFileProcessor.js";
class CallListService extends AbstractService {
    constructor(CallListRepository, baseSchema, fullSchema) {
        super(CallListRepository, baseSchema, fullSchema);
        this.onCreated = async (callList) => {
            const callFileProcessor = new CallFileProcessor();
            callFileProcessor.processCallFile(callList)
                .then(() => {
                console.log("CallList processed");
            })
                .catch(err => {
                console.error(err);
            });
        };
        this._validateOutput = true;
    }
}
export default CallListService;
export { CallListService };
