import {IEntitySchema} from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "mail",
    name: "MailboxUserSetting",
    identifier: "mailbox",
    apiBasePath: "mailbox-user-settings",
    apiTag: "MailboxUserSetting",
    collectionName: "MailboxUserSetting",
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
        user: {
            type: "ref",
            ref: "User",
            refDisplay: "name",
            required: true,
            index: true,
            header: true,
            mdCol: 6,
        },
        signatureHtml: {
            type: "longString",
            required: false,
            header: false,
            mdCol: 12,
        },
        signatureText: {
            type: "longString",
            required: false,
            header: false,
            mdCol: 12,
        },
    },
};

export default entitySchema;
export {entitySchema};
