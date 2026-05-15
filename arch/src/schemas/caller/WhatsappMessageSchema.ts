import { IEntitySchema } from "@drax/arch";

const WhatsappMessageSchema: IEntitySchema = {
    module: "caller",
    name: "WhatsappMessage",
    apiBasePath: "whatsapp-messages",
    apiTag: "WhatsappMessage",
    schema: {
        sentAt: { type: "date", required: true, index: true, header: true },
        user: { type: "ref", ref: "User", refDisplay: "name", required: true, index: true, header: true },
        destinationNumber: { type: "string", required: true, index: true, search: true, header: true },
        template: { type: "string", required: true, index: true, search: true, header: true },
    },
};

export default WhatsappMessageSchema;
export { WhatsappMessageSchema };
