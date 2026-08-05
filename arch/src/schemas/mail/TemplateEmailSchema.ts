import {IEntitySchema} from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "mail",
    name: "TemplateEmail",
    identifier: "name",
    apiBasePath: "template-emails",
    apiTag: "TemplateEmail",
    collectionName: "TemplateEmail",
    schema: {
        mailbox: {
            type: "ref",
            ref: "Mailbox",
            refDisplay: "name",
            required: true,
            index: true,
            header: true,
            mdCol: 6,
        },
        name: {
            type: "string",
            required: true,
            index: true,
            search: true,
            header: true,
            mdCol: 6,
        },
        content: {
            type: "longString",
            required: true,
            search: true,
            header: false,
            mdCol: 12,
        },
    },
};

export default entitySchema;
export {entitySchema};
