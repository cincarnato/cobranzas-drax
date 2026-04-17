import { ArchGenerator } from '@drax/arch';

//Import schemas
import CallFailedTypeSchema from './schemas/caller/CallFailedTypeSchema';
import CallListSchema from './schemas/caller/CallListSchema';
import CallLogSchema from './schemas/caller/CallLogSchema';
import CallSuccessTypeSchema from './schemas/caller/CallSuccessTypeSchema';
import PadronSchema from './schemas/afilmed/PadronSchema';
import CovenantSchema from './schemas/collections/CovenantSchema';
import GroupZoneSchema from './schemas/collections/GroupZoneSchema';
import InboundEmailSchema from './schemas/mail/InboundEmailSchema';
import MailboxSchema from './schemas/mail/MailboxSchema';
import AffiliateSchema from './schemas/premedic/AffiliateSchema';
import AffiliateTypeSchema from './schemas/premedic/AffiliateTypeSchema';
import BankMovementSchema from './schemas/transferencias/BankMovementSchema';
import PayerEntitySchema from './schemas/transferencias/PayerEntitySchema';
import TransferEmailSchema from './schemas/transferencias/TransferEmailSchema';
const schemas = [
    //add schemas

    //Caller
    CallFailedTypeSchema,
    CallListSchema,
    CallLogSchema,
    CallSuccessTypeSchema,

    //Afilmed
    PadronSchema,

    //Cobranzas
    CovenantSchema,
    GroupZoneSchema,

    //Mail
    InboundEmailSchema,
    MailboxSchema,

    //Premedic
    AffiliateSchema,
    AffiliateTypeSchema,

    //Transferencias
    BankMovementSchema,
    PayerEntitySchema,
    TransferEmailSchema
];

const generator = new ArchGenerator(schemas);
generator.build()
