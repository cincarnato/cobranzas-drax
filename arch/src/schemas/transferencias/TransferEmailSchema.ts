import { IEntitySchema } from "@drax/arch";

const CURRENCIES = ["ARS", "USD", "EUR", "OTHER"];

const TransferEmailSchema: IEntitySchema = {
    module: "transferencias",
    name: "TransferEmail",
    apiBasePath: "transfer-emails",
    collectionName: "TransferEmail",
    apiTag: "transferencias",
    schema: {
        inboundEmail: {
            type: "ref",
            ref: "InboundEmail",
            refDisplay: "messageId",
            required: false,
            mdCol: 12,
        },
        isTransferProof: {
            type: "boolean",
            required: false,
            default: false,
            header: true,
            mdCol: 4,
        },
        amount: {
            type: "number",
            required: false,
            header: true,
            mdCol: 4,
        },
        currency: {
            type: "enum",
            enum: CURRENCIES,
            required: false,
            mdCol: 4,
        },
        transferDate: {
            type: "date",
            required: false,
            header: true,
            mdCol: 6,
        },
        operationNumber: {
            type: "string",
            required: false,
            index: true,
            search: false,
            header: true,
            mdCol: 6,
        },
        concept: {
            type: "string",
            required: false,
            search: false,
            mdCol: 6,
        },
        originAccount: {
            type: "string",
            required: false,
            index: true,
            search: false,
            mdCol: 6,
        },
        originCbu: {
            type: "string",
            required: false,
            index: true,
            search: false,
            mdCol: 6,
        },
        originAlias: {
            type: "string",
            required: false,
            search: false,
            mdCol: 6,
        },
        originBank: {
            type: "string",
            required: false,
            search: false,
            mdCol: 6,
        },
        destinationAccount: {
            type: "string",
            required: false,
            index: true,
            search: false,
            header: true,
            mdCol: 6,
        },
        destinationCbu: {
            type: "string",
            required: false,
            index: true,
            search: false,
            mdCol: 6,
        },
        destinationAlias: {
            type: "string",
            required: false,
            search: false,
            mdCol: 6,
        },
        destinationBank: {
            type: "string",
            required: false,
            search: false,
            mdCol: 6,
        },
        affiliateName: {
            type: "string",
            required: false,
            search: true,
            mdCol: 6,
        },
        affiliateEmail: {
            type: "string",
            required: false,
            search: true,
            mdCol: 6,
        },
        affiliateDocumentNumber: {
            type: "string",
            required: false,
            search: true,
            mdCol: 6,
        },
        needsHumanReview: {
            type: "boolean",
            required: false,
            default: false,
            header: true,
            mdCol: 6,
        },
    },
};

export default TransferEmailSchema;
export { TransferEmailSchema };
