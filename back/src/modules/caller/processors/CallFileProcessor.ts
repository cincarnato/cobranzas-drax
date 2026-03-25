import ExcelJS from "exceljs";
import CallListServiceFactory from "../factory/services/CallListServiceFactory.js";
import CallLogServiceFactory from "../factory/services/CallLogServiceFactory.js";
import type { ICallList } from "../interfaces/ICallList.js";
import type { ICallLogBase } from "../interfaces/ICallLog.js";
import type CallListService from "../services/CallListService.js";
import type CallLogService from "../services/CallLogService.js";

const CALL_LIST_IN_PROGRESS = "EN_CURSO";

const combineHeadersWithValues = (headers: string[], rowValues: unknown[]) => {
    const entries = headers.map((header, index) => [header, rowValues[index]]);
    return Object.fromEntries(entries);
};

const normalizeRowValues = (rowValues: unknown[]) => {
    const values = [...rowValues];

    if (values[0] === undefined || values[0] === null) {
        values.shift();
    }

    return values;
};

class CallFileProcessor {

    private callListService: CallListService = CallListServiceFactory.instance;
    private callLogService: CallLogService = CallLogServiceFactory.instance;

    private async createCallLog(callList: ICallList, headers: string[], rowValues: unknown[]) {
        const callLog: ICallLogBase = {
            callList: callList._id,
            attempts: 0,
            notes: "",
            typification: "",
            data: combineHeadersWithValues(headers, rowValues),
        };

        return this.callLogService.create(callLog);
    }

    async processCallFile(callList: ICallList) {


        if (!callList.file?.filepath) {
            throw new Error(`CallList file ${callList._id} not found`);
        }

        const filePath = callList.file.filepath;
        const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
            worksheets: "emit",
        });

        let headers: string[] | null = null;
        let total = 0;

        for await (const worksheetReader of workbookReader) {
            for await (const row of worksheetReader) {
                const values = normalizeRowValues(row.values as unknown[]);

                if (values.length === 0 || values.every((value) => value === undefined || value === null || value === "")) {
                    continue;
                }

                if (headers === null) {
                    headers = values.map((value) => String(value ?? ""));
                    await this.callListService.updatePartial(callList._id, { headers });
                    continue;
                }

                await this.createCallLog(callList, headers, values);
                total++;
            }
        }

        return this.callListService.updatePartial(callList._id, {
            headers: headers ?? [],
            total,
            state: CALL_LIST_IN_PROGRESS,
        });
    }
}

export default CallFileProcessor;
export { CallFileProcessor };
