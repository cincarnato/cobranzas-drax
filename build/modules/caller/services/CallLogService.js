import { AbstractService } from "@drax/crud-back";
import { BadRequestError, NotFoundError } from "@drax/common-back";
import CallListServiceFactory from "../factory/services/CallListServiceFactory.js";
import ExcelJS from "exceljs";
class CallLogService extends AbstractService {
    constructor(CallLogRepository, baseSchema, fullSchema) {
        super(CallLogRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
    get callLogRepository() {
        return this._repository;
    }
    async paginateByDataSearch({ page = 1, limit = 10, orderBy = this._defaultOrder, order = "asc", search = '', filters = [] }) {
        if (!search.trim()) {
            return this.paginate({ page, limit, orderBy, order, search, filters });
        }
        const callListId = this.extractCallListIdFromFilters(filters);
        if (!callListId) {
            throw new BadRequestError('callList filter is required');
        }
        const callListService = CallListServiceFactory.instance;
        const callList = await callListService.findById(callListId);
        if (!callList) {
            throw new NotFoundError();
        }
        const dataFields = (callList.headers ?? [])
            .map((header) => header)
            .filter((header) => Boolean(header));
        console.log("dataFields", dataFields);
        if (!dataFields.length) {
            return {
                page,
                limit,
                total: 0,
                items: []
            };
        }
        const pagination = await this.callLogRepository.paginateByDataSearch?.({
            page,
            limit,
            orderBy,
            order,
            search,
            filters,
            dataFields
        });
        if (!pagination) {
            return this.paginate({ page, limit, orderBy, order, search: '', filters });
        }
        if (this.transformRead) {
            pagination.items = await Promise.all(pagination.items.map(item => this.transformRead(item)));
        }
        if (this._fullSchema) {
            pagination.items = await Promise.all(pagination.items.map(item => this.validateOutput(item)));
        }
        return pagination;
    }
    async registerAttempt(id, payload) {
        const currentCallLog = await this.findById(id);
        if (!currentCallLog) {
            throw new NotFoundError();
        }
        const currentAttempts = currentCallLog.attempts ?? 0;
        const nextAttempts = currentAttempts + 1;
        const state = payload.state ?? currentCallLog.state;
        const typification = state === 'promesa'
            ? (payload.typification?.trim() || 'Promesa de pago')
            : (payload.typification ?? '');
        const promiseDate = state === 'promesa'
            ? (payload.promiseDate ?? null)
            : null;
        const updatedCallLog = await this.updatePartial(id, {
            attempts: nextAttempts,
            notes: payload.notes ?? '',
            typification,
            state,
            promiseDate,
            done: payload.done ?? false
        });
        if (!updatedCallLog) {
            throw new NotFoundError();
        }
        const callListId = typeof currentCallLog.callList === 'object'
            ? currentCallLog.callList?._id
            : currentCallLog.callList;
        if (!callListId) {
            throw new Error('CallLog without callList');
        }
        const callListService = CallListServiceFactory.instance;
        const currentCallList = await callListService.findById(callListId);
        if (!currentCallList) {
            throw new NotFoundError();
        }
        const attemptsControl = [...(currentCallList.attemptsControl ?? [])];
        const attemptControlIndex = attemptsControl.findIndex(item => item.number === nextAttempts);
        if (attemptControlIndex === -1) {
            attemptsControl.push({
                number: nextAttempts,
                count: 1,
                success: state === 'exitosa' ? 1 : 0,
                promises: state === 'promesa' ? 1 : 0
            });
        }
        else {
            const attemptControl = attemptsControl[attemptControlIndex] ?? {};
            attemptsControl[attemptControlIndex] = {
                ...attemptControl,
                number: nextAttempts,
                count: (attemptControl.count ?? 0) + 1,
                success: (attemptControl.success ?? 0) + (state === 'exitosa' ? 1 : 0),
                promises: (attemptControl.promises ?? 0) + (state === 'promesa' ? 1 : 0)
            };
        }
        await callListService.updatePartial(callListId, {
            attempts: (currentCallList.attempts ?? 0) + 1,
            attemptsControl,
            failed: (currentCallList.failed ?? 0) + (state === 'fallida' ? 1 : 0),
            success: (currentCallList.success ?? 0) + (state === 'exitosa' ? 1 : 0),
            promises: (currentCallList.promises ?? 0) + (state === 'promesa' ? 1 : 0)
        });
        return updatedCallLog;
    }
    async exportExcel(callListId) {
        const callListService = CallListServiceFactory.instance;
        const callList = await callListService.findById(callListId);
        if (!callList) {
            throw new NotFoundError();
        }
        if (!callList.isExportable) {
            throw new BadRequestError('CallList is not exportable');
        }
        const rows = await this.find({
            limit: 100000,
            orderBy: 'createdAt',
            order: 'asc',
            filters: [
                { field: 'callList', operator: 'eq', value: callListId }
            ]
        });
        if (!rows.length) {
            throw new BadRequestError('No hay llamadas registradas');
        }
        const workbook = new ExcelJS.Workbook();
        const fileName = `${this.sanitizeFileName(callList.name)}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        const worksheetName = fileName.replace(/\.xlsx$/i, '').slice(0, 31) || 'call_logs';
        const worksheet = workbook.addWorksheet(worksheetName);
        const dataKeys = this.collectDataKeys(rows);
        worksheet.columns = [
            ...dataKeys.map((key) => ({
                header: key,
                key,
                width: Math.max(16, Math.min(40, key.length + 4))
            })),
            { header: 'Intentos', key: 'attempts', width: 12 },
            { header: 'Estado', key: 'state', width: 16 },
            { header: 'Tipificacion', key: 'typification', width: 24 },
            { header: 'Notas', key: 'notes', width: 32 },
            { header: 'Fecha promesa', key: 'promiseDate', width: 18 },
            { header: 'Gestionado', key: 'done', width: 12 },
            { header: 'Creado', key: 'createdAt', width: 22 },
        ];
        for (const row of rows) {
            const normalizedData = this.normalizeData(row.data);
            const worksheetRow = worksheet.addRow({
                ...Object.fromEntries(dataKeys.map((key) => [key, this.stringifyCellValue(normalizedData[key])])),
                attempts: row.attempts ?? 0,
                state: row.state ?? '',
                typification: row.typification ?? '',
                notes: row.notes ?? '',
                promiseDate: this.formatDateTime(row.promiseDate),
                done: row.done ? 'Si' : 'No',
                createdAt: this.formatDateTime(row.createdAt),
            });
            worksheetRow.eachCell((cell) => {
                cell.alignment = { vertical: 'middle' };
            });
        }
        worksheet.getRow(1).font = { bold: true };
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
        return {
            buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
            fileName
        };
    }
    collectDataKeys(rows) {
        const keys = new Set();
        for (const row of rows) {
            const normalizedData = this.normalizeData(row.data);
            for (const key of Object.keys(normalizedData)) {
                keys.add(key);
            }
        }
        return Array.from(keys);
    }
    extractCallListIdFromFilters(filters) {
        const callListFilter = filters.find((filter) => filter.field === 'callList' && filter.operator === 'eq');
        return typeof callListFilter?.value === 'string' ? callListFilter.value : '';
    }
    normalizeData(data) {
        if (!data) {
            return {};
        }
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                    ? parsed
                    : {};
            }
            catch {
                return {};
            }
        }
        if (typeof data === 'object' && !Array.isArray(data)) {
            return data;
        }
        return {};
    }
    stringifyCellValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        if (value instanceof Date) {
            return this.formatDateTime(value);
        }
        if (Array.isArray(value) || typeof value === 'object') {
            return JSON.stringify(value);
        }
        return value;
    }
    formatDateTime(value) {
        if (!value) {
            return '';
        }
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        return date.toISOString();
    }
    sanitizeFileName(value) {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_')
            .replace(/[^A-Za-z0-9_-]/g, '')
            .replace(/^_+|_+$/g, '') || 'call_logs';
    }
}
export default CallLogService;
export { CallLogService };
