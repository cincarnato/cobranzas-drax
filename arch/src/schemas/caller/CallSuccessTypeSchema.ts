import { IEntitySchema } from "@drax/arch";

const CallSuccessTypeSchema: IEntitySchema = {
    module: "caller",
    name: "CallSuccessType",
    apiBasePath: "call-success-types",
    apiTag: "CallSuccessType",
    schema: {
        name: { type: "string", required: false, header: true, search: true },
        color: { type: "string", required: false, header: true },
    },
};

export default CallSuccessTypeSchema;
export { CallSuccessTypeSchema };
