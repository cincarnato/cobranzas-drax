import { IEntitySchema } from "@drax/arch";

const CovenantSchema: IEntitySchema = {
    module: "collections",
    name: "Covenant",
    apiBasePath: 'covenants',
    apiTag: 'Covenant',
    schema: {
        date: { type: 'date', required: true, header: true },
        link: { type: 'string', required: false },
        since: { type: 'string', required: true, header: true },
        until: { type: 'string', required: true, header: true },
        month: { type: 'string', required: true, header: true },
        fullname: { type: 'string', required: true, header: true, search: true },
        dni: { type: 'string', required: true, header: true, search: true },
        locality: { type: 'string', required: true },
        address: { type: 'string', required: true },
        amount: { type: 'number', required: true, header: true },
        comment: { type: 'string', required: false },
        group: { type: 'ref', ref: 'Group', refDisplay: 'name', required: true, header: true },
        createdBy: { type: 'ref', ref: 'User', refDisplay: 'name', required: true },
        updatedBy: { type: 'ref', ref: 'User', refDisplay: 'name', required: true },
        status: { type: 'string', required: false, header: true },
        refuseComment: { type: 'string', required: false },
        refuseBy: { type: 'ref', ref: 'User', refDisplay: 'name', required: false },
    }
}

export default CovenantSchema;
export { CovenantSchema };
