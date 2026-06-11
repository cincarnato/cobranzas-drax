
import type{IPayerRepository} from "../interfaces/IPayerRepository";
import type {IPayerBase, IPayer, IPayerLookupCriteria} from "../interfaces/IPayer";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class PayerService extends AbstractService<IPayer, IPayerBase, IPayerBase> {

    private readonly payerRepository: IPayerRepository;

    constructor(PayerRepository: IPayerRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PayerRepository, baseSchema, fullSchema);
        this.payerRepository = PayerRepository;
        
        this._validateOutput = true
        
    }

    async findByAnyStrategy(criteria: IPayerLookupCriteria[]): Promise<IPayer[]> {
        return this.payerRepository.findByAnyStrategy(criteria);
    }

}

export default PayerService
export {PayerService}
