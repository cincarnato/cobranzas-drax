import { IEntitySchema } from "@drax/arch";

const CallFailedTypeSchema: IEntitySchema = {
    module: "caller",
    name: "CallFailedType",
    apiBasePath: "call-failed-types",
    apiTag: "CallFailedType",
    schema: {
        name: { type: "string", required: false, header: true, search: true },
        color: { type: "string", required: false, header: true },
    },
};

export default CallFailedTypeSchema;
export { CallFailedTypeSchema };
