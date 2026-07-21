import { IEntitySchema } from "@drax/arch";

const TypificationEmailSchema: IEntitySchema = {
    module: "mail",
    name: "TypificationEmail",
    identifier: "name",
    apiBasePath: "typification-emails",
    collectionName: "TypificationEmail",
    apiTag: "mail",
    schema: {
        name: {
            type: "string",
            required: true,
            unique: true,
            index: true,
            search: true,
            header: true,
            mdCol: 6,
        },
        description: {
            type: "longString",
            required: false,
            search: true,
            mdCol: 12,
        },
    },
};

export default TypificationEmailSchema;
export { TypificationEmailSchema };
