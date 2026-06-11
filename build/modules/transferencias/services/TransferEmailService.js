import { AbstractService } from "@drax/crud-back";
import ExcelJS from "exceljs";
class TransferEmailService extends AbstractService {
    constructor(TransferEmailRepository, baseSchema, fullSchema) {
        super(TransferEmailRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
    async create(data) {
        data = this.withReevaluatedNeedsHumanReview(null, data);
        return super.create(data);
    }
    async update(id, data) {
        const currentTransferEmail = await this.findById(id);
        data = this.withReevaluatedNeedsHumanReview(currentTransferEmail, data);
        return super.update(id, data);
    }
    async updatePartial(id, data) {
        const currentTransferEmail = await this.findById(id);
        data = this.withReevaluatedNeedsHumanReview(currentTransferEmail, data);
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
            { header: 'ID Mail', key: 'emailMessageId', width: 32 },
            { header: 'Asunto Mail', key: 'emailSubject', width: 42 },
            { header: 'Remitente Nombre', key: 'emailFromName', width: 28 },
            { header: 'Remitente Email', key: 'emailFromEmail', width: 32 },
            { header: 'DNI Email', key: 'emailDocumentNumber', width: 16 },
            { header: 'DNI Afiliado', key: 'affiliateDocumentNumber', width: 16 },
            { header: 'Nombre Afiliado', key: 'affiliateName', width: 32 },
            { header: 'Afiliados Adicionales', key: 'additionalAffiliates', width: 50 },
            { header: 'Fecha Transferencia', key: 'transferDate', width: 20 },
            { header: 'Fecha Email', key: 'emailDate', width: 20 },
            { header: 'Fecha Proceso', key: 'processDate', width: 20 },
            { header: 'Monto', key: 'amount', width: 14 },
            { header: 'Mes', key: 'month', width: 14 },
            { header: 'Numero Operacion', key: 'operationNumber', width: 22 },
            { header: 'Concepto', key: 'concept', width: 28 },
            { header: 'CBU Origen', key: 'originCbu', width: 24 },
            { header: 'Alias Origen', key: 'originAlias', width: 24 },
            { header: 'Banco Origen', key: 'originBank', width: 24 },
            { header: 'Observaciones', key: 'observations', width: 36 },
        ];
        for (const row of rows) {
            worksheet.addRow({
                emailMessageId: row.emailMessageId ?? '',
                emailSubject: row.emailSubject ?? '',
                emailFromName: row.emailFromName ?? '',
                emailFromEmail: row.emailFromEmail ?? '',
                emailDocumentNumber: row.emailDocumentNumber ?? '',
                affiliateDocumentNumber: row.affiliateDocumentNumber ?? '',
                affiliateName: row.affiliateName ?? '',
                additionalAffiliates: this.formatAdditionalAffiliates(row.additionalAffiliates),
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
            });
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
    formatAdditionalAffiliates(additionalAffiliates) {
        return (additionalAffiliates || [])
            .map((affiliate) => [
            affiliate.name,
            affiliate.email,
            affiliate.documentNumber,
        ].filter(Boolean).join(' / '))
            .filter(Boolean)
            .join('; ');
    }
    withReevaluatedNeedsHumanReview(currentTransferEmail, data) {
        const mergedTransferEmail = {
            ...(currentTransferEmail || {}),
            ...data,
        };
        return {
            ...data,
            needsHumanReview: this.resolveNeedsHumanReview(currentTransferEmail, mergedTransferEmail, data.needsHumanReview),
        };
    }
    resolveNeedsHumanReview(currentTransferEmail, nextTransferEmail, requestedNeedsHumanReview) {
        if (this.isMissingCriticalTransferData(nextTransferEmail)) {
            return true;
        }
        if (requestedNeedsHumanReview === true) {
            return true;
        }
        if (currentTransferEmail?.needsHumanReview
            && !this.isMissingCriticalTransferData(currentTransferEmail)) {
            return true;
        }
        return false;
    }
    isMissingCriticalTransferData(transferEmail) {
        return !transferEmail.amount || !transferEmail.affiliateDocumentNumber || !transferEmail.transferDate;
    }
}
export default TransferEmailService;
export { TransferEmailService };
