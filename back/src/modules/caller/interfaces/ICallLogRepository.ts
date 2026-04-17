
import type {ICallLog, ICallLogBase} from './ICallLog'
import {IDraxCrudRepository} from "@drax/crud-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";

interface ICallLogPaginateSearchOptions extends IDraxPaginateOptions {
    dataFields?: string[]
}

interface ICallLogRepository extends IDraxCrudRepository<ICallLog, ICallLogBase, ICallLogBase>{
    paginateByDataSearch?(options: ICallLogPaginateSearchOptions): Promise<IDraxPaginateResult<ICallLog>>
}

export {ICallLogRepository}
export type {ICallLogPaginateSearchOptions}

