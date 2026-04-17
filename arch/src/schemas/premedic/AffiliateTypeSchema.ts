import { IEntitySchema } from "@drax/arch";

const AffiliateSchema: IEntitySchema = {
    module: "premedic",
    name: "AffiliateType",
    collectionName: "AffiliateType",
    apiBasePath: "affiliate-types",
    apiTag: "premedic",
    schema: {
        nombre: { type: "string", required: true, header: true, search: true, index: true },
        descripcion: { type: "string", required: false, header: true, search: false, index: false },
    },
};

export default AffiliateSchema;
export { AffiliateSchema };
