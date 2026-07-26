
import type{IInternalTransferBonusRepository} from "../interfaces/IInternalTransferBonusRepository";
import type {IInternalTransferBonusBase, IInternalTransferBonus} from "../interfaces/IInternalTransferBonus";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class InternalTransferBonusService extends AbstractService<IInternalTransferBonus, IInternalTransferBonusBase, IInternalTransferBonusBase> {


    constructor(InternalTransferBonusRepository: IInternalTransferBonusRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(InternalTransferBonusRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default InternalTransferBonusService
export {InternalTransferBonusService}
