
import type{ITransferEmailRepository} from "../interfaces/ITransferEmailRepository";
import type {
    ITransferEmailBase,
    ITransferEmail,
    TransferEmailAiStatus,
    TransferEmailHumanStatus,
    TransferEmailStatus
} from "../interfaces/ITransferEmail";
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

    async create(data: ITransferEmailBase): Promise<ITransferEmail> {
        data = this.withResolvedProcessingFields(null, data)
        return super.create(data)
    }

    async update(id: string, data: ITransferEmailBase): Promise<ITransferEmail> {
        const currentTransferEmail = await this.findById(id)
        data = this.withResolvedProcessingFields(currentTransferEmail, data)
        return super.update(id, data)
    }

    async updatePartial(id: string, data: ITransferEmailBase): Promise<ITransferEmail> {
        const currentTransferEmail = await this.findById(id)
        data = this.withResolvedProcessingFields(currentTransferEmail, data)
        return super.updatePartial(id, data)
    }

    async exportExcel(options: IDraxFindOptions): Promise<ITransferEmailExcelExportResult> {
        const rows = await this.find({
            ...options,
            limit: options.limit || 100000,
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('transferencias')

        worksheet.columns = [
            {header: 'ID Mail', key: 'emailMessageId', width: 32},
            {header: 'Asunto Mail', key: 'emailSubject', width: 42},
            {header: 'Remitente Nombre', key: 'emailFromName', width: 28},
            {header: 'Remitente Email', key: 'emailFromEmail', width: 32},
            {header: 'DNI Email', key: 'emailDocumentNumber', width: 16},
            {header: 'Afiliados', key: 'affiliates', width: 50},
            {header: 'Fecha Transferencia', key: 'transferDate', width: 20},
            {header: 'Fecha Email', key: 'emailDate', width: 20},
            {header: 'Fecha Proceso', key: 'processDate', width: 20},
            {header: 'Monto Comprobante', key: 'amount', width: 18},
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
                emailMessageId: row.emailMessageId ?? '',
                emailSubject: row.emailSubject ?? '',
                emailFromName: row.emailFromName ?? '',
                emailFromEmail: row.emailFromEmail ?? '',
                emailDocumentNumber: row.emailDocumentNumber ?? '',
                affiliates: this.formatAffiliates(row.affiliates),
                transferDate: row.transferDate ? new Date(row.transferDate) : '',
                emailDate: row.emailDate ? new Date(row.emailDate) : '',
                processDate: row.processDate ? new Date(row.processDate) : '',
                amount: row.amount ?? null,
                month: this.formatAffiliateMonths(row.affiliates),
                operationNumber: row.operationNumber ?? '',
                concept: row.concept ?? '',
                originCbu: row.originCbu ?? '',
                originAlias: row.originAlias ?? '',
                originBank: row.originBank ?? '',
                observations: this.formatAffiliateObservations(row.affiliates),
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

    private formatAffiliates(affiliates?: ITransferEmail['affiliates']): string {
        return (affiliates || [])
            .map((affiliate) => [
                affiliate.name,
                affiliate.email,
                affiliate.amount,
                affiliate.documentNumber,
                affiliate.month,
                affiliate.observations,
            ].filter(Boolean).join(' / '))
            .filter(Boolean)
            .join('; ')
    }

    private formatAffiliateMonths(affiliates?: ITransferEmail['affiliates']): string {
        return Array.from(new Set((affiliates || []).map((affiliate) => affiliate.month).filter(Boolean))).join('; ')
    }

    private formatAffiliateObservations(affiliates?: ITransferEmail['affiliates']): string {
        return (affiliates || []).map((affiliate) => affiliate.observations).filter(Boolean).join('; ')
    }

    private withResolvedProcessingFields(
        currentTransferEmail: ITransferEmail | null,
        data: ITransferEmailBase
    ): ITransferEmailBase {
        const mergedTransferEmail = {
            ...(currentTransferEmail || {}),
            ...data,
        }
        const aiStatus = this.resolveAiStatus(currentTransferEmail, data, mergedTransferEmail)
        const humanStatus = this.resolveHumanStatus(currentTransferEmail, data)
        const status = this.resolveStatus(currentTransferEmail, data, aiStatus, humanStatus)

        return {
            ...data,
            aiStatus,
            humanStatus,
            status,
            needsHumanReview: this.resolveNeedsHumanReview(currentTransferEmail, mergedTransferEmail, data.needsHumanReview, aiStatus),
        }
    }

    private resolveAiStatus(
        currentTransferEmail: ITransferEmail | null,
        data: ITransferEmailBase,
        mergedTransferEmail: ITransferEmailBase
    ): TransferEmailAiStatus {
        if (data.aiStatus) {
            return data.aiStatus
        }

        if (currentTransferEmail?.aiStatus) {
            return currentTransferEmail.aiStatus
        }

        if (this.isLikelyAiProcessed(mergedTransferEmail)) {
            return this.isMissingCriticalTransferData(mergedTransferEmail)
                ? 'PROCESADO_INCOMPLETO'
                : 'PROCESADO_CONFIABLE'
        }

        return 'PENDIENTE'
    }

    private resolveHumanStatus(
        currentTransferEmail: ITransferEmail | null,
        data: ITransferEmailBase
    ): TransferEmailHumanStatus {
        return data.humanStatus || currentTransferEmail?.humanStatus || 'PENDIENTE'
    }

    private resolveStatus(
        currentTransferEmail: ITransferEmail | null,
        data: ITransferEmailBase,
        aiStatus: TransferEmailAiStatus,
        humanStatus: TransferEmailHumanStatus
    ): TransferEmailStatus {
        if (data.status) {
            return data.status
        }

        if (['VALIDADO', 'CORREGIDO', 'DESCARTADO'].includes(humanStatus)) {
            return 'AUDITADO'
        }

        if (currentTransferEmail?.status === 'AUDITADO') {
            return 'AUDITADO'
        }

        if (currentTransferEmail?.status) {
            return currentTransferEmail.status
        }

        return aiStatus === 'PENDIENTE'
            ? 'PENDIENTE_IA'
            : 'PENDIENTE_AUDITORIA'
    }

    private resolveNeedsHumanReview(
        currentTransferEmail: ITransferEmail | null,
        nextTransferEmail: Pick<ITransferEmail, 'amount' | 'affiliates' | 'transferDate' | 'needsHumanReview'>,
        requestedNeedsHumanReview: boolean | undefined,
        aiStatus?: TransferEmailAiStatus
    ): boolean {
        if (requestedNeedsHumanReview !== undefined) {
            return requestedNeedsHumanReview
        }

        if (aiStatus === 'PROCESADO_CON_DUDAS' || aiStatus === 'PROCESADO_INCOMPLETO' || aiStatus === 'ERROR_PROCESAMIENTO') {
            return true
        }

        if (aiStatus === 'PROCESADO_CONFIABLE') {
            return false
        }

        if (this.isMissingCriticalTransferData(nextTransferEmail)) {
            return true
        }

        if (
            currentTransferEmail?.needsHumanReview
            && !this.isMissingCriticalTransferData(currentTransferEmail)
        ) {
            return true
        }

        return false
    }

    private isMissingCriticalTransferData(
        transferEmail: Pick<ITransferEmail, 'amount' | 'affiliates' | 'transferDate'>
    ): boolean {
        const hasAffiliateDocumentNumber = Boolean(
            transferEmail.affiliates?.some((affiliate) => Boolean(affiliate.documentNumber))
        )

        return !transferEmail.amount || !hasAffiliateDocumentNumber || !transferEmail.transferDate
    }

    private isLikelyAiProcessed(transferEmail: ITransferEmailBase): boolean {
        return Boolean(
            transferEmail.processDate
            || transferEmail.aiProcessedAt
            || transferEmail.isTransferProof
            || transferEmail.emailMessageId
            || transferEmail.inboundEmail
        )
    }

}

export default TransferEmailService
export {TransferEmailService}
export type {ITransferEmailExcelExportResult}
