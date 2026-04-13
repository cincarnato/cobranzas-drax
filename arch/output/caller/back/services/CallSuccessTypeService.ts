
import type{ICallSuccessTypeRepository} from "../interfaces/ICallSuccessTypeRepository";
import type {ICallSuccessTypeBase, ICallSuccessType} from "../interfaces/ICallSuccessType";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CallSuccessTypeService extends AbstractService<ICallSuccessType, ICallSuccessTypeBase, ICallSuccessTypeBase> {


    constructor(CallSuccessTypeRepository: ICallSuccessTypeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CallSuccessTypeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default CallSuccessTypeService
export {CallSuccessTypeService}
