
import type{IPadronRepository} from "../interfaces/IPadronRepository";
import type {IPadronBase, IPadron} from "../interfaces/IPadron";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import ExcelJS from "exceljs";
import {BadRequestError} from "@drax/common-back";
import {FileServiceFactory} from "@drax/media-back";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

type PadronImportFormat = "CSV" | "XLSX"

interface IPadronImportOptions {
    buffer: Buffer
    filename?: string
    mimetype?: string
}

interface IPadronStoredFile {
    filepath?: string
    filename?: string
    mimetype?: string
}

interface IPadronImportResult {
    status: "success"
    rowCount: number
    time: number
    message: string
}

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
] as const

const PADRON_NUMBER_FIELDS = new Set([
    "ente",
    "cant_inte",
    "deuda1",
    "deuda2",
    "deuda3",
    "deuda4",
    "subtotal",
    "total_ctacte"
])

const PADRON_DATE_FIELDS = new Set([
    "periodo1",
    "periodo2",
    "periodo3",
    "periodo4",
    "baja_fecha"
])

class PadronService extends AbstractService<IPadron, IPadronBase, IPadronBase> {

    private readonly PadronRepository: IPadronRepository

    constructor(PadronRepository: IPadronRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PadronRepository, baseSchema, fullSchema);
        this.PadronRepository = PadronRepository
        
        this._validateOutput = true
        
    }

    async importFile({buffer, filename = "", mimetype = ""}: IPadronImportOptions): Promise<IPadronImportResult> {
        const start = Date.now()
        const format = this.resolveImportFormat(buffer, filename, mimetype)
        const rows = format === "XLSX"
            ? await this.parseXlsx(buffer)
            : this.parseCsv(buffer.toString("utf8"))

        if (!rows.length) {
            throw new BadRequestError("El archivo no contiene filas para importar.")
        }

        const payloads: IPadronBase[] = []
        for (const row of rows) {
            const payload = await this.validateInputCreate(row)
            payloads.push(payload)
        }

        await this.PadronRepository.deleteAll()

        for (const payload of payloads) {
            await this.create(payload)
        }

        return {
            status: "success",
            rowCount: payloads.length,
            time: Date.now() - start,
            message: "Import successful"
        }
    }

    async importStoredFile(file: IPadronStoredFile): Promise<IPadronImportResult> {
        if (!file?.filepath) {
            throw new BadRequestError("Debe subir un archivo .xlsx o .csv.")
        }

        const metadata = await FileServiceFactory.instance.findOneBy("relativePath", file.filepath)
        const absolutePath = metadata?.absolutePath || resolve(process.cwd(), file.filepath)
        const buffer = await readFile(absolutePath)

        return this.importFile({
            buffer,
            filename: file.filename || metadata?.filename || file.filepath,
            mimetype: file.mimetype || metadata?.mimetype || ""
        })
    }

    private resolveImportFormat(buffer: Buffer, filename: string, mimetype: string): PadronImportFormat {
        const extension = filename.split(".").pop()?.toLowerCase()
        const isZipBasedXlsx = buffer[0] === 0x50 && buffer[1] === 0x4B

        if ((extension === "xlsx" || mimetype.includes("spreadsheetml")) && isZipBasedXlsx) {
            return "XLSX"
        }

        if (extension === "csv" || mimetype.includes("csv") || mimetype.includes("text/plain") || this.looksLikeText(buffer)) {
            return "CSV"
        }

        throw new BadRequestError("Formato no soportado. Suba un archivo .xlsx o .csv.")
    }

    private async parseXlsx(buffer: Buffer): Promise<IPadronBase[]> {
        const workbook = new ExcelJS.Workbook()
        try {
            await workbook.xlsx.load(buffer as any)
        } catch (error: any) {
            throw new BadRequestError(`No se pudo leer el XLSX. Verifique que el archivo sea un .xlsx valido. ${error?.message || ""}`.trim())
        }
        const worksheet = workbook.worksheets[0]

        if (!worksheet) {
            throw new BadRequestError("El archivo Excel no contiene hojas.")
        }

        const headers = this.normalizeHeaders(worksheet.getRow(1).values as ExcelJS.CellValue[])
        const rows: IPadronBase[] = []

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                return
            }

            const payload = this.buildPayload(headers, row.values as ExcelJS.CellValue[])
            if (payload) {
                rows.push(payload)
            }
        })

        return rows
    }

    private parseCsv(content: string): IPadronBase[] {
        const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim())
        if (!lines.length) {
            return []
        }

        const separator = this.detectCsvSeparator(lines[0])
        const headers = this.normalizeHeaders(this.parseCsvLine(lines[0], separator))

        return lines
            .slice(1)
            .map(line => this.buildPayload(headers, this.parseCsvLine(line, separator)))
            .filter((row): row is IPadronBase => Boolean(row))
    }

    private looksLikeText(buffer: Buffer): boolean {
        const sample = buffer.subarray(0, Math.min(buffer.length, 512))
        return !sample.includes(0)
    }

    private detectCsvSeparator(headerLine: string) {
        const separators = [";", ",", "\t"]
        return separators
            .map(separator => ({separator, count: this.parseCsvLine(headerLine, separator).length}))
            .sort((a, b) => b.count - a.count)[0].separator
    }

    private parseCsvLine(line: string, separator: string): string[] {
        const values: string[] = []
        let current = ""
        let quoted = false

        for (let index = 0; index < line.length; index += 1) {
            const char = line[index]
            const nextChar = line[index + 1]

            if (char === '"' && quoted && nextChar === '"') {
                current += '"'
                index += 1
                continue
            }

            if (char === '"') {
                quoted = !quoted
                continue
            }

            if (char === separator && !quoted) {
                values.push(current)
                current = ""
                continue
            }

            current += char
        }

        values.push(current)
        return values
    }

    private normalizeHeaders(values: unknown[]): string[] {
        return values.map(value => this.normalizeHeader(value))
    }

    private normalizeHeader(value: unknown) {
        return String(this.getCellValue(value) ?? "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
    }

    private buildPayload(headers: string[], values: unknown[]): IPadronBase | null {
        const payload: Record<string, unknown> = {}

        for (const field of PADRON_IMPORT_FIELDS) {
            const index = headers.indexOf(field)
            if (index < 0) {
                continue
            }

            const value = this.normalizeValue(field, this.getCellValue(values[index]))
            if (value !== undefined) {
                payload[field] = value
            }
        }

        if (!Object.values(payload).some(value => value !== undefined && value !== null && value !== "")) {
            return null
        }

        return payload as unknown as IPadronBase
    }

    private normalizeValue(field: string, value: unknown) {
        if (value === undefined || value === null) {
            return undefined
        }

        if (typeof value === "string") {
            value = value.trim()
            if (value === "") {
                return undefined
            }
        }

        if (PADRON_NUMBER_FIELDS.has(field)) {
            return this.parseNumber(value)
        }

        if (PADRON_DATE_FIELDS.has(field)) {
            return this.parseDate(value)
        }

        return String(value)
    }

    private parseNumber(value: unknown): number | undefined {
        if (typeof value === "number") {
            return value
        }

        const rawValue = String(value).trim()
        const normalized = rawValue.includes(",")
            ? rawValue.replace(/\./g, "").replace(",", ".")
            : rawValue
        const numberValue = Number(normalized)
        return Number.isFinite(numberValue) ? numberValue : undefined
    }

    private parseDate(value: unknown): Date | undefined {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value
        }

        if (typeof value === "number") {
            const date = new Date(Math.round((value - 25569) * 86400 * 1000))
            return Number.isNaN(date.getTime()) ? undefined : date
        }

        const rawValue = String(value).trim()
        if (!rawValue) {
            return undefined
        }

        const date = new Date(rawValue)
        return Number.isNaN(date.getTime()) ? undefined : date
    }

    private getCellValue(value: any): unknown {
        if (value && typeof value === "object") {
            if ("text" in value) {
                return value.text
            }
            if ("result" in value) {
                return value.result
            }
            if ("richText" in value && Array.isArray(value.richText)) {
                return value.richText.map((part: any) => part.text).join("")
            }
        }

        return value
    }

}

export default PadronService
export {PadronService}
