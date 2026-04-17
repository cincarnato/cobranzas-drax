import { IEntitySchema } from "@drax/arch";

const GroupZoneSchema: IEntitySchema = {
    module: "collections",
    name: "GroupZone",
    collectionName: "group",
    apiBasePath: 'group-zones',
    apiTag: 'GroupZone',
    schema: {
        name: {
            type: 'string',
            required: true,
            index: true,
            search: true,
            unique: true,
            header: true
        },
        users: {
            type: 'array.ref',
            ref: 'User',
            refDisplay: 'username',
            required: false,
            header: false
        }
    }
}

export default GroupZoneSchema;
export { GroupZoneSchema };
