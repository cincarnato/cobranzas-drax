import type {ICallListRepository} from "../interfaces/ICallListRepository";
import type {ICallListBase, ICallList} from "../interfaces/ICallList";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import CallFileProcessor from "../processors/CallFileProcessor.js";

class CallListService extends AbstractService<ICallList, ICallListBase, ICallListBase> {


    constructor(CallListRepository: ICallListRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CallListRepository, baseSchema, fullSchema);

        this._validateOutput = true

    }

    onCreated = async (callList: ICallList) => {
        const callFileProcessor = new CallFileProcessor()
        callFileProcessor.processCallFile(callList)
            .then(
                () => {
                    console.log("CallList processed")
                }
            )
            .catch(err => {
                console.error(err);
            })
    }

}

export default CallListService
export {CallListService}
