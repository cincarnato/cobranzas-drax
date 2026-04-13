import { IEntitySchema } from "@drax/arch";

const CALL_LIST_STATES = [
    "PREPARANDO",
    "EN_CURSO",
    "ARCHIVADO",
    "FINALIZADO",
    "VENCIDO",
];

const CallListSchema: IEntitySchema = {
    module: "caller",
    name: "CallList",
    apiBasePath: "call-lists",
    apiTag: "CallList",
    schema: {
        group: { type: "ref", ref: "Group", refDisplay: "name", required: false, header: true },
        user: { type: "ref", ref: "User", refDisplay: "name", required: false, header: true },
        file: { type: "fullFile", required: false, header: true },
        state: {
            type: "enum",
            enum: CALL_LIST_STATES,
            default: "PREPARANDO",
            required: false,
            header: true,
        },
        total: { type: "number", default: 0, required: false, header: true },
        attempts: { type: "number", default: 0, required: false, header: true },
        attemptsControl: {
            type: "array.object",
            required: false,
            schema: {
                number: { type: "number", default: 0, required: false },
                count: { type: "number", default: 0, required: false },
                success: { type: "number", default: 0, required: false },
                promises: { type: "number", default: 0, required: false },
            },
        },
        success: { type: "number", default: 0, required: false, header: true },
        promises: { type: "number", default: 0, required: false, header: true },
        failed: { type: "number", default: 0, required: false, header: true },
        deadline: { type: "date", required: false, header: true },
        name: { type: "string", required: true, unique: true, index: true, header: true, search: true },
        headers: { type: "array.string", required: false },
    },
};

export default CallListSchema;
export { CallListSchema };
