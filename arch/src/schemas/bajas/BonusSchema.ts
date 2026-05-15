import { IEntitySchema } from "@drax/arch";

const BonusSchema: IEntitySchema = {
    module: "bajas",
    name: "Bonus",
    apiBasePath: "bonuses",
    collectionName: "bonuses",
    apiTag: "Bajas",
    schema: {
        dni: { type: "string", required: true, header: true, search: true, mdCol: 6 },
        fullname: { type: "string", required: true, header: true, search: true, mdCol: 6 },
        plan: { type: "string", required: true, header: true, search: true, mdCol: 6 },
        appliedMonth: { type: "string", required: true, header: true, mdCol: 6 },
        paymentMethod: { type: "string", required: true, header: true, mdCol: 6 },
        bonus: { type: "string", required: true, header: true, mdCol: 6 },
        bonifiedNetValue: { type: "number", required: true, header: true, mdCol: 6 },
        status: {
            type: "enum",
            enum: ["Pendiente", "Aplicado", "No aplicado"],
            required: true,
            default: "Pendiente",
            header: true,
            mdCol: 6,
        },
        observation: { type: "longString", required: false, mdCol: 12 },
        createdBy: {
            type: "ref",
            ref: "User",
            refDisplay: "name",
            required: true,
            header: true,
            mdCol: 6,
        },
    },
};

export default BonusSchema;
export { BonusSchema };
