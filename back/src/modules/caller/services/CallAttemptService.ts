import type{ICallAttemptRepository} from "../interfaces/ICallAttemptRepository";
import type {ICallAttemptBase, ICallAttempt} from "../interfaces/ICallAttempt";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CallAttemptService extends AbstractService<ICallAttempt, ICallAttemptBase, ICallAttemptBase> {

    constructor(CallAttemptRepository: ICallAttemptRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CallAttemptRepository, baseSchema, fullSchema);
        this._validateOutput = true
    }

}

export default CallAttemptService
export {CallAttemptService}
