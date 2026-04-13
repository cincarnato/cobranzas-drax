
import type{ITransferEmailRepository} from "../interfaces/ITransferEmailRepository";
import type {ITransferEmailBase, ITransferEmail} from "../interfaces/ITransferEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TransferEmailService extends AbstractService<ITransferEmail, ITransferEmailBase, ITransferEmailBase> {


    constructor(TransferEmailRepository: ITransferEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TransferEmailRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default TransferEmailService
export {TransferEmailService}
