import { AbstractService } from "@drax/crud-back";
import ExcelJS from "exceljs";
class TransferEmailService extends AbstractService {
    constructor(TransferEmailRepository, baseSchema, fullSchema) {
        super(TransferEmailRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
    async create(data) {
        data = this.withResolvedProcessingFields(null, data);
        return super.create(data);
    }
    async update(id, data) {
        const currentTransferEmail = await this.findById(id);
        data = this.withResolvedProcessingFields(currentTransferEmail, data);
        return super.update(id, data);
    }
    async updatePartial(id, data) {
        const currentTransferEmail = await this.findById(id);
        data = this.withResolvedProcessingFields(currentTransferEmail, data);
        return super.updatePartial(id, data);
    }
    async exportExcel(options) {
        const rows = await this.find({
            ...options,
            limit: options.limit || 100000,
        });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('transferencias');
        worksheet.columns = [
            { header: 'Fecha Transferencia', key: 'transferDate', width: 20 },
            { header: 'DNI', key: 'documentNumber', width: 18 },
            { header: 'Nombre', key: 'name', width: 28 },
            { header: 'Monto', key: 'amount', width: 18 },
            { header: 'Mes', key: 'month', width: 14 },
            { header: 'Observaciones', key: 'observations', width: 36 },
            { header: 'Numero Operacion', key: 'operationNumber', width: 22 },
            { header: 'Concepto', key: 'concept', width: 28 },
            { header: 'Asunto Mail', key: 'emailSubject', width: 42 },
            { header: 'Remitente Nombre', key: 'emailFromName', width: 28 },
            { header: 'Remitente Email', key: 'emailFromEmail', width: 32 },
            { header: 'ID Mail', key: 'emailMessageId', width: 32 },
            { header: 'DNI Email', key: 'emailDocumentNumber', width: 16 },
            { header: 'Fecha Email', key: 'emailDate', width: 20 },
            { header: 'Fecha Proceso', key: 'processDate', width: 20 },
            { header: 'CBU Origen', key: 'originCbu', width: 24 },
            { header: 'Alias Origen', key: 'originAlias', width: 24 },
            { header: 'Banco Origen', key: 'originBank', width: 24 },
        ];
        for (const row of rows) {
            for (const affiliate of row.affiliates || []) {
                worksheet.addRow({
                    emailMessageId: row.emailMessageId ?? '',
                    emailSubject: row.emailSubject ?? '',
                    emailFromName: row.emailFromName ?? '',
                    emailFromEmail: row.emailFromEmail ?? '',
                    emailDocumentNumber: row.emailDocumentNumber ?? '',
                    transferDate: row.transferDate ? new Date(row.transferDate) : '',
                    emailDate: row.emailDate ? new Date(row.emailDate) : '',
                    processDate: row.processDate ? new Date(row.processDate) : '',
                    operationNumber: row.operationNumber ?? '',
                    concept: row.concept ?? '',
                    originCbu: row.originCbu ?? '',
                    originAlias: row.originAlias ?? '',
                    originBank: row.originBank ?? '',
                    name: affiliate.name ?? '',
                    amount: affiliate.amount ?? null,
                    documentNumber: affiliate.documentNumber ?? '',
                    month: affiliate.month ?? '',
                    observations: affiliate.observations ?? '',
                });
            }
        }
        worksheet.getRow(1).font = { bold: true };
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
        worksheet.getColumn('transferDate').numFmt = 'dd/mm/yyyy';
        worksheet.getColumn('emailDate').numFmt = 'dd/mm/yyyy hh:mm';
        worksheet.getColumn('processDate').numFmt = 'dd/mm/yyyy hh:mm';
        worksheet.getColumn('amount').numFmt = '$ #,##0.00';
        return {
            buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
            fileName: `transferencias_${new Date().toISOString().slice(0, 10)}.xlsx`
        };
    }
    withResolvedProcessingFields(currentTransferEmail, data) {
        const mergedTransferEmail = {
            ...(currentTransferEmail || {}),
            ...data,
        };
        const aiStatus = this.resolveAiStatus(currentTransferEmail, data, mergedTransferEmail);
        const humanStatus = this.resolveHumanStatus(currentTransferEmail, data);
        const status = this.resolveStatus(currentTransferEmail, data, aiStatus, humanStatus);
        return {
            ...data,
            aiStatus,
            humanStatus,
            status,
            needsHumanReview: this.resolveNeedsHumanReview(currentTransferEmail, mergedTransferEmail, data.needsHumanReview, aiStatus),
        };
    }
    resolveAiStatus(currentTransferEmail, data, mergedTransferEmail) {
        if (data.aiStatus) {
            return data.aiStatus;
        }
        if (currentTransferEmail?.aiStatus) {
            return currentTransferEmail.aiStatus;
        }
        if (this.isLikelyAiProcessed(mergedTransferEmail)) {
            return this.isMissingCriticalTransferData(mergedTransferEmail)
                ? 'PROCESADO_INCOMPLETO'
                : 'PROCESADO_CONFIABLE';
        }
        return 'PENDIENTE';
    }
    resolveHumanStatus(currentTransferEmail, data) {
        return data.humanStatus || currentTransferEmail?.humanStatus || 'PENDIENTE';
    }
    resolveStatus(currentTransferEmail, data, aiStatus, humanStatus) {
        if (data.status) {
            return data.status;
        }
        if (['VALIDADO', 'CORREGIDO', 'DESCARTADO'].includes(humanStatus)) {
            return 'AUDITADO';
        }
        if (currentTransferEmail?.status === 'AUDITADO') {
            return 'AUDITADO';
        }
        if (currentTransferEmail?.status) {
            return currentTransferEmail.status;
        }
        return aiStatus === 'PENDIENTE'
            ? 'PENDIENTE_IA'
            : 'PENDIENTE_AUDITORIA';
    }
    resolveNeedsHumanReview(currentTransferEmail, nextTransferEmail, requestedNeedsHumanReview, aiStatus) {
        if (requestedNeedsHumanReview !== undefined) {
            return requestedNeedsHumanReview;
        }
        if (aiStatus === 'PROCESADO_CON_DUDAS' || aiStatus === 'PROCESADO_INCOMPLETO' || aiStatus === 'ERROR_PROCESAMIENTO') {
            return true;
        }
        if (aiStatus === 'PROCESADO_CONFIABLE') {
            return false;
        }
        if (this.isMissingCriticalTransferData(nextTransferEmail)) {
            return true;
        }
        if (currentTransferEmail?.needsHumanReview
            && !this.isMissingCriticalTransferData(currentTransferEmail)) {
            return true;
        }
        return false;
    }
    isMissingCriticalTransferData(transferEmail) {
        const hasAffiliateDocumentNumber = Boolean(transferEmail.affiliates?.some((affiliate) => Boolean(affiliate.documentNumber)));
        return !transferEmail.amount || !hasAffiliateDocumentNumber || !transferEmail.transferDate;
    }
    isLikelyAiProcessed(transferEmail) {
        return Boolean(transferEmail.processDate
            || transferEmail.aiProcessedAt
            || transferEmail.isTransferProof
            || transferEmail.emailMessageId
            || transferEmail.inboundEmail);
    }
}
export default TransferEmailService;
export { TransferEmailService };
