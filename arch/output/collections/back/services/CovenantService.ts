
import type{ICovenantRepository} from "../interfaces/ICovenantRepository";
import type {ICovenantBase, ICovenant} from "../interfaces/ICovenant";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CovenantService extends AbstractService<ICovenant, ICovenantBase, ICovenantBase> {


    constructor(CovenantRepository: ICovenantRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CovenantRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default CovenantService
export {CovenantService}
