import type {ICallAttempt, ICallAttemptBase} from './ICallAttempt'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ICallAttemptRepository extends IDraxCrudRepository<ICallAttempt, ICallAttemptBase, ICallAttemptBase>{}

export {ICallAttemptRepository}
