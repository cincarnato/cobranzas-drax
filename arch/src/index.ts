import { ArchGenerator } from '@drax/arch';

//Import schemas
import CallFailedTypeSchema from './schemas/caller/CallFailedTypeSchema';
import CallListSchema from './schemas/caller/CallListSchema';
import CallLogSchema from './schemas/caller/CallLogSchema';
import CallSuccessTypeSchema from './schemas/caller/CallSuccessTypeSchema';
import CovenantSchema from './schemas/collections/CovenantSchema';
import GroupZoneSchema from './schemas/collections/GroupZoneSchema';
const schemas = [
    //add schemas
    CallFailedTypeSchema,
    CallListSchema,
    CallLogSchema,
    CallSuccessTypeSchema,
    CovenantSchema,
    GroupZoneSchema
];

const generator = new ArchGenerator(schemas);
generator.build()
