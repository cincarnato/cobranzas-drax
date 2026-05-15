import { AbstractService } from "@drax/crud-back";
import ExcelJS from "exceljs";
class BonusService extends AbstractService {
    constructor(BonusRepository, baseSchema, fullSchema) {
        super(BonusRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
    async exportExcel(from, to, operator) {
        const filters = [
            { field: 'createdAt', operator: 'gte', value: from },
            { field: 'createdAt', operator: 'lte', value: to }
        ];
        if (operator) {
            filters.push({ field: 'createdBy', operator: 'eq', value: operator });
        }
        const rows = await this.find({
            limit: 100000,
            orderBy: 'createdAt',
            order: 'asc',
            filters
        });
        const workbook = new ExcelJS.Workbook();
        const fileName = `bonificaciones_${from.slice(0, 10)}_${to.slice(0, 10)}.xlsx`;
        const worksheet = workbook.addWorksheet('bonificaciones');
        worksheet.columns = [
            { header: 'Fecha de carga', key: 'createdAt', width: 18 },
            { header: 'Operador', key: 'createdBy', width: 24 },
            { header: 'DNI', key: 'dni', width: 14 },
            { header: 'Nombre y apellido', key: 'fullname', width: 28 },
            { header: 'Plan', key: 'plan', width: 18 },
            { header: 'Aplica (mes)', key: 'appliedMonth', width: 14 },
            { header: 'Forma de pago', key: 'paymentMethod', width: 18 },
            { header: 'Bonificacion', key: 'bonus', width: 18 },
            { header: 'Valor neto bonificado', key: 'bonifiedNetValue', width: 20 },
            { header: 'Estado', key: 'status', width: 14 },
            { header: 'Observacion', key: 'observation', width: 32 },
        ];
        for (const row of rows) {
            worksheet.addRow({
                createdAt: row.createdAt ? new Date(row.createdAt).toLocaleString('es-AR') : '',
                createdBy: this.resolveUserName(row.createdBy),
                dni: row.dni,
                fullname: row.fullname,
                plan: row.plan,
                appliedMonth: row.appliedMonth,
                paymentMethod: row.paymentMethod,
                bonus: row.bonus,
                bonifiedNetValue: row.bonifiedNetValue,
                status: row.status,
                observation: row.observation ?? '',
            });
        }
        worksheet.getRow(1).font = { bold: true };
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
        return {
            buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
            fileName
        };
    }
    resolveUserName(user) {
        if (!user) {
            return '';
        }
        if (typeof user === 'string') {
            return user;
        }
        return user.name ?? user.username ?? user._id?.toString() ?? '';
    }
}
export default BonusService;
export { BonusService };
