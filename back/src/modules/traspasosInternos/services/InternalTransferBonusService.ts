
import type{IInternalTransferBonusRepository} from "../interfaces/IInternalTransferBonusRepository";
import type {IInternalTransferBonusBase, IInternalTransferBonus} from "../interfaces/IInternalTransferBonus";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import ExcelJS from "exceljs";
import type {IDraxFieldFilter} from "@drax/crud-share";

interface IInternalTransferBonusExcelExportResult {
    buffer: Buffer
    fileName: string
}

class InternalTransferBonusService extends AbstractService<IInternalTransferBonus, IInternalTransferBonusBase, IInternalTransferBonusBase> {


    constructor(InternalTransferBonusRepository: IInternalTransferBonusRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(InternalTransferBonusRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

    async exportExcel(from: string, to: string, operator?: string): Promise<IInternalTransferBonusExcelExportResult> {
        const filters: IDraxFieldFilter[] = [
            {field: 'createdAt', operator: 'gte', value: from},
            {field: 'createdAt', operator: 'lte', value: to}
        ]

        if (operator) {
            filters.push({field: 'createdBy', operator: 'eq', value: operator})
        }

        const rows = await this.find({
            limit: 100000,
            orderBy: 'createdAt',
            order: 'asc',
            filters
        })

        const workbook = new ExcelJS.Workbook()
        const fileName = `bonificaciones_tpi_${from.slice(0, 10)}_${to.slice(0, 10)}.xlsx`
        const worksheet = workbook.addWorksheet('bonificaciones_tpi')

        worksheet.columns = [
            {header: 'Fecha de carga', key: 'createdAt', width: 18},
            {header: 'Operador', key: 'createdBy', width: 24},
            {header: 'DNI', key: 'dni', width: 14},
            {header: 'Nombre y apellido', key: 'fullname', width: 28},
            {header: 'Aplica (mes)', key: 'appliedMonth', width: 14},
            {header: 'Valor bonificado', key: 'bonifiedValue', width: 18},
            {header: 'Tipo de bonificacion', key: 'bonusType', width: 28},
            {header: 'Adjunto datos bancarios', key: 'bankDataAttachment', width: 34},
            {header: 'Estado', key: 'status', width: 14},
            {header: 'Observacion', key: 'observation', width: 32},
        ]

        for (const row of rows) {
            worksheet.addRow({
                createdAt: row.createdAt ? new Date(row.createdAt).toLocaleString('es-AR') : '',
                createdBy: this.resolveUserName(row.createdBy),
                dni: row.dni,
                fullname: row.fullname,
                appliedMonth: row.appliedMonth,
                bonifiedValue: row.bonifiedValue,
                bonusType: row.bonusType,
                bankDataAttachment: row.bankDataAttachment?.url ?? row.bankDataAttachment?.filepath ?? '',
                status: row.status,
                observation: row.observation ?? '',
            })
        }

        worksheet.getRow(1).font = {bold: true}
        worksheet.views = [{state: 'frozen', ySplit: 1}]

        return {
            buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
            fileName
        }
    }

    private resolveUserName(user: any) {
        if (!user) {
            return ''
        }

        if (typeof user === 'string') {
            return user
        }

        return user.name ?? user.username ?? user._id?.toString() ?? ''
    }

}

export default InternalTransferBonusService
export {InternalTransferBonusService}
