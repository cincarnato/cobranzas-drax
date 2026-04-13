
import type{IBankMovementRepository} from "../interfaces/IBankMovementRepository";
import type {IBankMovementBase, IBankMovement} from "../interfaces/IBankMovement";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class BankMovementService extends AbstractService<IBankMovement, IBankMovementBase, IBankMovementBase> {


    constructor(BankMovementRepository: IBankMovementRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(BankMovementRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default BankMovementService
export {BankMovementService}
