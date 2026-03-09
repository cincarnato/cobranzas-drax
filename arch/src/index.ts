import { ArchGenerator } from '@drax/arch';

//Import schemas
import CovenantSchema from './schemas/collections/CovenantSchema';
import GroupZoneSchema from './schemas/collections/GroupZoneSchema';
const schemas = [
    //add schemas
    CovenantSchema,
    GroupZoneSchema
];

const generator = new ArchGenerator(schemas);
generator.build()
