
import type{ICallListRepository} from "../interfaces/ICallListRepository";
import type {ICallListBase, ICallList} from "../interfaces/ICallList";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CallListService extends AbstractService<ICallList, ICallListBase, ICallListBase> {


    constructor(CallListRepository: ICallListRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CallListRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default CallListService
export {CallListService}
