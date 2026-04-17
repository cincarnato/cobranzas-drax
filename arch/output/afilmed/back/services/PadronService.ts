
import type{IPadronRepository} from "../interfaces/IPadronRepository";
import type {IPadronBase, IPadron} from "../interfaces/IPadron";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class PadronService extends AbstractService<IPadron, IPadronBase, IPadronBase> {


    constructor(PadronRepository: IPadronRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PadronRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default PadronService
export {PadronService}
