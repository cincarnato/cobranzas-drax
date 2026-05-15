
import type{IBonusRepository} from "../interfaces/IBonusRepository";
import type {IBonusBase, IBonus} from "../interfaces/IBonus";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class BonusService extends AbstractService<IBonus, IBonusBase, IBonusBase> {


    constructor(BonusRepository: IBonusRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(BonusRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default BonusService
export {BonusService}
