import { IEntitySchema } from "@drax/arch";

const CALL_LOG_STATES = ["pendiente", "intentada", "fallida", "promesa", "exitosa"];

const CallLogSchema: IEntitySchema = {
    module: "caller",
    name: "CallLog",
    apiBasePath: "call-logs",
    apiTag: "CallLog",
    schema: {
        callList: { type: "ref", ref: "CallList", refDisplay: "name", required: true, index: true, header: true },
        attempts: { type: "number", default: 0, required: false, header: true },
        notes: { type: "string", required: false },
        typification: { type: "string", required: false, header: true, search: true },
        state: {
            type: "enum",
            enum: CALL_LOG_STATES,
            default: "pendiente",
            required: false,
            header: true,
        },
        promiseDate: { type: "date", required: false, header: true },
        done: { type: "boolean", default: false, required: false, header: true },
        data: { type: "record", required: false },
    },
};

export default CallLogSchema;
export { CallLogSchema };
