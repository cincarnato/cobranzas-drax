
import type{ICallFailedTypeRepository} from "../interfaces/ICallFailedTypeRepository";
import type {ICallFailedTypeBase, ICallFailedType} from "../interfaces/ICallFailedType";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CallFailedTypeService extends AbstractService<ICallFailedType, ICallFailedTypeBase, ICallFailedTypeBase> {


    constructor(CallFailedTypeRepository: ICallFailedTypeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CallFailedTypeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default CallFailedTypeService
export {CallFailedTypeService}
