
import type{ICallLogRepository} from "../interfaces/ICallLogRepository";
import type {ICallLogBase, ICallLog} from "../interfaces/ICallLog";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CallLogService extends AbstractService<ICallLog, ICallLogBase, ICallLogBase> {


    constructor(CallLogRepository: ICallLogRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CallLogRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default CallLogService
export {CallLogService}
