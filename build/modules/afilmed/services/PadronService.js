import { AbstractService } from "@drax/crud-back";
import ExcelJS from "exceljs";
import { BadRequestError } from "@drax/common-back";
import { FileServiceFactory } from "@drax/media-back";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const PADRON_IMPORT_FIELDS = [
    "origen",
    "ente",
    "contra",
    "ape_nom",
    "cant_inte",
    "plan_codi",
    "domicilio",
    "loca",
    "tele",
    "deuda1",
    "deuda2",
    "deuda3",
    "deuda4",
    "periodo1",
    "periodo2",
    "periodo3",
    "periodo4",
    "subtotal",
    "pago_forma",
    "cobrador",
    "total_ctacte",
    "baja_fecha",
    "nro_ref_elect",
    "celular",
    "deno_provin",
    "alias",
    "cbu_siro"
];
const PADRON_NUMBER_FIELDS = new Set([
    "ente",
    "cant_inte",
    "deuda1",
    "deuda2",
    "deuda3",
    "deuda4",
    "subtotal",
    "total_ctacte"
]);
const PADRON_DATE_FIELDS = new Set([
    "periodo1",
    "periodo2",
    "periodo3",
    "periodo4",
    "baja_fecha"
]);
class PadronService extends AbstractService {
    constructor(PadronRepository, baseSchema, fullSchema) {
        super(PadronRepository, baseSchema, fullSchema);
        this.PadronRepository = PadronRepository;
        this._validateOutput = true;
    }
    async importFile({ buffer, filename = "", mimetype = "" }) {
        const start = Date.now();
        const format = this.resolveImportFormat(buffer, filename, mimetype);
        const rows = format === "XLSX"
            ? await this.parseXlsx(buffer)
            : this.parseCsv(buffer.toString("utf8"));
        if (!rows.length) {
            throw new BadRequestError("El archivo no contiene filas para importar.");
        }
        const payloads = [];
        for (const row of rows) {
            const payload = await this.validateInputCreate(row);
            payloads.push(payload);
        }
        await this.PadronRepository.deleteAll();
        for (const payload of payloads) {
            await this.create(payload);
        }
        return {
            status: "success",
            rowCount: payloads.length,
            time: Date.now() - start,
            message: "Import successful"
        };
    }
    async importStoredFile(file) {
        if (!file?.filepath) {
            throw new BadRequestError("Debe subir un archivo .xlsx o .csv.");
        }
        const metadata = await FileServiceFactory.instance.findOneBy("relativePath", file.filepath);
        const absolutePath = metadata?.absolutePath || resolve(process.cwd(), file.filepath);
        const buffer = await readFile(absolutePath);
        return this.importFile({
            buffer,
            filename: file.filename || metadata?.filename || file.filepath,
            mimetype: file.mimetype || metadata?.mimetype || ""
        });
    }
    resolveImportFormat(buffer, filename, mimetype) {
        const extension = filename.split(".").pop()?.toLowerCase();
        const isZipBasedXlsx = buffer[0] === 0x50 && buffer[1] === 0x4B;
        if ((extension === "xlsx" || mimetype.includes("spreadsheetml")) && isZipBasedXlsx) {
            return "XLSX";
        }
        if (extension === "csv" || mimetype.includes("csv") || mimetype.includes("text/plain") || this.looksLikeText(buffer)) {
            return "CSV";
        }
        throw new BadRequestError("Formato no soportado. Suba un archivo .xlsx o .csv.");
    }
    async parseXlsx(buffer) {
        const workbook = new ExcelJS.Workbook();
        try {
            await workbook.xlsx.load(buffer);
        }
        catch (error) {
            throw new BadRequestError(`No se pudo leer el XLSX. Verifique que el archivo sea un .xlsx valido. ${error?.message || ""}`.trim());
        }
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new BadRequestError("El archivo Excel no contiene hojas.");
        }
        const headers = this.normalizeHeaders(worksheet.getRow(1).values);
        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                return;
            }
            const payload = this.buildPayload(headers, row.values);
            if (payload) {
                rows.push(payload);
            }
        });
        return rows;
    }
    parseCsv(content) {
        const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
        if (!lines.length) {
            return [];
        }
        const separator = this.detectCsvSeparator(lines[0]);
        const headers = this.normalizeHeaders(this.parseCsvLine(lines[0], separator));
        return lines
            .slice(1)
            .map(line => this.buildPayload(headers, this.parseCsvLine(line, separator)))
            .filter((row) => Boolean(row));
    }
    looksLikeText(buffer) {
        const sample = buffer.subarray(0, Math.min(buffer.length, 512));
        return !sample.includes(0);
    }
    detectCsvSeparator(headerLine) {
        const separators = [";", ",", "\t"];
        return separators
            .map(separator => ({ separator, count: this.parseCsvLine(headerLine, separator).length }))
            .sort((a, b) => b.count - a.count)[0].separator;
    }
    parseCsvLine(line, separator) {
        const values = [];
        let current = "";
        let quoted = false;
        for (let index = 0; index < line.length; index += 1) {
            const char = line[index];
            const nextChar = line[index + 1];
            if (char === '"' && quoted && nextChar === '"') {
                current += '"';
                index += 1;
                continue;
            }
            if (char === '"') {
                quoted = !quoted;
                continue;
            }
            if (char === separator && !quoted) {
                values.push(current);
                current = "";
                continue;
            }
            current += char;
        }
        values.push(current);
        return values;
    }
    normalizeHeaders(values) {
        return values.map(value => this.normalizeHeader(value));
    }
    normalizeHeader(value) {
        return String(this.getCellValue(value) ?? "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_");
    }
    buildPayload(headers, values) {
        const payload = {};
        for (const field of PADRON_IMPORT_FIELDS) {
            const index = headers.indexOf(field);
            if (index < 0) {
                continue;
            }
            const value = this.normalizeValue(field, this.getCellValue(values[index]));
            if (value !== undefined) {
                payload[field] = value;
            }
        }
        if (!Object.values(payload).some(value => value !== undefined && value !== null && value !== "")) {
            return null;
        }
        return payload;
    }
    normalizeValue(field, value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        if (typeof value === "string") {
            value = value.trim();
            if (value === "") {
                return undefined;
            }
        }
        if (PADRON_NUMBER_FIELDS.has(field)) {
            return this.parseNumber(value);
        }
        if (PADRON_DATE_FIELDS.has(field)) {
            return this.parseDate(value);
        }
        return String(value);
    }
    parseNumber(value) {
        if (typeof value === "number") {
            return value;
        }
        const rawValue = String(value).trim();
        const normalized = rawValue.includes(",")
            ? rawValue.replace(/\./g, "").replace(",", ".")
            : rawValue;
        const numberValue = Number(normalized);
        return Number.isFinite(numberValue) ? numberValue : undefined;
    }
    parseDate(value) {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value;
        }
        if (typeof value === "number") {
            const date = new Date(Math.round((value - 25569) * 86400 * 1000));
            return Number.isNaN(date.getTime()) ? undefined : date;
        }
        const rawValue = String(value).trim();
        if (!rawValue) {
            return undefined;
        }
        const date = new Date(rawValue);
        return Number.isNaN(date.getTime()) ? undefined : date;
    }
    getCellValue(value) {
        if (value && typeof value === "object") {
            if ("text" in value) {
                return value.text;
            }
            if ("result" in value) {
                return value.result;
            }
            if ("richText" in value && Array.isArray(value.richText)) {
                return value.richText.map((part) => part.text).join("");
            }
        }
        return value;
    }
}
export default PadronService;
export { PadronService };
