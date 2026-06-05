
import type{ITransferEmailRepository} from "../interfaces/ITransferEmailRepository";
import type {ITransferEmailBase, ITransferEmail} from "../interfaces/ITransferEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import ExcelJS from "exceljs";
import type {IDraxFindOptions} from "@drax/crud-share";

interface ITransferEmailExcelExportResult {
    buffer: Buffer
    fileName: string
}

class TransferEmailService extends AbstractService<ITransferEmail, ITransferEmailBase, ITransferEmailBase> {


    constructor(TransferEmailRepository: ITransferEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TransferEmailRepository, baseSchema, fullSchema);
        
        this._validateOutput = true

    }

    async exportExcel(options: IDraxFindOptions): Promise<ITransferEmailExcelExportResult> {
        const rows = await this.find({
            ...options,
            limit: options.limit || 100000,
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('transferencias')

        worksheet.columns = [
            {header: 'DNI Afiliado', key: 'affiliateDocumentNumber', width: 16},
            {header: 'Nombre Afiliado', key: 'affiliateName', width: 32},
            {header: 'Fecha Transferencia', key: 'transferDate', width: 20},
            {header: 'Fecha Email', key: 'emailDate', width: 20},
            {header: 'Fecha Proceso', key: 'processDate', width: 20},
            {header: 'Monto', key: 'amount', width: 14},
            {header: 'Mes', key: 'month', width: 14},
            {header: 'Numero Operacion', key: 'operationNumber', width: 22},
            {header: 'Concepto', key: 'concept', width: 28},
            {header: 'CBU Origen', key: 'originCbu', width: 24},
            {header: 'Alias Origen', key: 'originAlias', width: 24},
            {header: 'Banco Origen', key: 'originBank', width: 24},
            {header: 'Observaciones', key: 'observations', width: 36},
        ]

        for (const row of rows) {
            worksheet.addRow({
                affiliateDocumentNumber: row.affiliateDocumentNumber ?? '',
                affiliateName: row.affiliateName ?? '',
                transferDate: row.transferDate ? new Date(row.transferDate) : '',
                emailDate: row.emailDate ? new Date(row.emailDate) : '',
                processDate: row.processDate ? new Date(row.processDate) : '',
                amount: row.amount ?? null,
                month: row.month ?? '',
                operationNumber: row.operationNumber ?? '',
                concept: row.concept ?? '',
                originCbu: row.originCbu ?? '',
                originAlias: row.originAlias ?? '',
                originBank: row.originBank ?? '',
                observations: row.observations ?? '',
            })
        }

        worksheet.getRow(1).font = {bold: true}
        worksheet.views = [{state: 'frozen', ySplit: 1}]
        worksheet.getColumn('transferDate').numFmt = 'dd/mm/yyyy'
        worksheet.getColumn('emailDate').numFmt = 'dd/mm/yyyy hh:mm'
        worksheet.getColumn('processDate').numFmt = 'dd/mm/yyyy hh:mm'
        worksheet.getColumn('amount').numFmt = '$ #,##0.00'

        return {
            buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
            fileName: `transferencias_${new Date().toISOString().slice(0, 10)}.xlsx`
        }
    }

}

export default TransferEmailService
export {TransferEmailService}
export type {ITransferEmailExcelExportResult}
