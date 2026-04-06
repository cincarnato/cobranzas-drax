import { ArchGenerator } from '@drax/arch';

//Import schemas
import CallFailedTypeSchema from './schemas/caller/CallFailedTypeSchema';
import CallListSchema from './schemas/caller/CallListSchema';
import CallLogSchema from './schemas/caller/CallLogSchema';
import CallSuccessTypeSchema from './schemas/caller/CallSuccessTypeSchema';
import PadronSchema from './schemas/afilmed/PadronSchema';
import CovenantSchema from './schemas/collections/CovenantSchema';
import GroupZoneSchema from './schemas/collections/GroupZoneSchema';
import AffiliateSchema from './schemas/transferencias/AffiliateSchema';
import BankMovementSchema from './schemas/transferencias/BankMovementSchema';
import PayerEntitySchema from './schemas/transferencias/PayerEntitySchema';
const schemas = [
    //add schemas
    CallFailedTypeSchema,
    CallListSchema,
    CallLogSchema,
    CallSuccessTypeSchema,
    PadronSchema,
    CovenantSchema,
    GroupZoneSchema,
    AffiliateSchema,
    BankMovementSchema,
    PayerEntitySchema
];

const generator = new ArchGenerator(schemas);
generator.build()
