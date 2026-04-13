
import type {ICallLog, ICallLogBase} from './ICallLog'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ICallLogRepository extends IDraxCrudRepository<ICallLog, ICallLogBase, ICallLogBase>{

}

export {ICallLogRepository}


