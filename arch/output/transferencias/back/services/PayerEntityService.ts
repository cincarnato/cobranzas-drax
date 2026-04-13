
import type{IPayerEntityRepository} from "../interfaces/IPayerEntityRepository";
import type {IPayerEntityBase, IPayerEntity} from "../interfaces/IPayerEntity";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class PayerEntityService extends AbstractService<IPayerEntity, IPayerEntityBase, IPayerEntityBase> {


    constructor(PayerEntityRepository: IPayerEntityRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PayerEntityRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default PayerEntityService
export {PayerEntityService}
