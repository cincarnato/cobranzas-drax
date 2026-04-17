
import {AbstractMongoRepository} from "@drax/crud-back";
import {CallLogModel} from "../../models/CallLogModel.js";
import type {ICallLogRepository} from '../../interfaces/ICallLogRepository'
import type {ICallLog, ICallLogBase} from "../../interfaces/ICallLog";
import type {ICallLogPaginateSearchOptions} from "../../interfaces/ICallLogRepository";
import type {IDraxPaginateResult} from "@drax/crud-share";
import {MongooseQueryFilter, MongooseSort} from "@drax/common-back";
import type {PaginateOptions, PaginateResult} from "mongoose";

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}


class CallLogMongoRepository extends AbstractMongoRepository<ICallLog, ICallLogBase, ICallLogBase> implements ICallLogRepository {

    constructor() {
        super();
        this._model = CallLogModel;
        this._searchFields = ['typification'];
        this._populateFields = ['callList'];
        this._lean = true
    }

    async paginateByDataSearch({
        page = 1,
        limit = 5,
        orderBy = '',
        order = "asc",
        search = '',
        filters = [],
        dataFields = []
    }: ICallLogPaginateSearchOptions): Promise<IDraxPaginateResult<ICallLog>> {
        const query: Record<string, any> = {}

        const normalizedSearch = search.trim()
        const searchableDataFields = Array.from(new Set(
            dataFields
                .filter((field): field is string => Boolean(field))
        ))

        if (normalizedSearch && searchableDataFields.length > 0) {
            const escapedSearch = escapeRegExp(normalizedSearch)
            query['$or'] = searchableDataFields.map((field) => ({
                [`data.${field}`]: {
                    $regex: escapedSearch,
                    $options: 'i'
                }
            }))
        }

        MongooseQueryFilter.applyFilters(query, filters, this._model)

        console.log("query", JSON.stringify(query,null,4) )

        const sort = MongooseSort.applySort(orderBy, order)
        const populate = this._populateFields
        const lean = this._lean
        const options = {page, limit, sort, populate, lean} as PaginateOptions
        const items: PaginateResult<ICallLog> = await this._model.paginate(query, options)

        return {
            page,
            limit,
            total: items.totalDocs,
            items: items.docs
        }
    }

}

export default CallLogMongoRepository
export {CallLogMongoRepository}
