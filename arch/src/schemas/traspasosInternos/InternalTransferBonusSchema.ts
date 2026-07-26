import { IEntitySchema } from "@drax/arch";

const InternalTransferBonusSchema: IEntitySchema = {
    module: "traspasosInternos",
    name: "InternalTransferBonus",
    apiBasePath: "internal-transfer-bonuses",
    collectionName: "internalTransferBonuses",
    apiTag: "Traspasos Internos",
    schema: {
        dni: { type: "string", required: true, header: true, search: true, mdCol: 6 },
        fullname: { type: "string", required: true, header: true, search: true, mdCol: 6 },
        appliedMonth: { type: "string", required: true, header: true, mdCol: 6 },
        bonifiedValue: { type: "number", required: true, header: true, mdCol: 6 },
        bonusType: {
            type: "enum",
            enum: ["Crédito en Cuenta Corriente", "Transferencia Bancaria"],
            required: true,
            header: true,
            mdCol: 6,
        },
        bankDataAttachment: { type: "fullFile", required: false, header: true, mdCol: 6 },
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

export default InternalTransferBonusSchema;
export { InternalTransferBonusSchema };
