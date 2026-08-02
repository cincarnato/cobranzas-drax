
import { z } from 'zod';


const MailboxUserSettingBaseSchema = z.object({
      mailbox: z.coerce.string().min(1,'validation.required'),
    user: z.coerce.string().min(1,'validation.required'),
    signatureHtml: z.string().optional(),
    signatureText: z.string().optional()
});

const MailboxUserSettingSchema = MailboxUserSettingBaseSchema
    .extend({
      _id: z.coerce.string(),
       mailbox: z.object({_id: z.coerce.string(), name: z.string()}),
user: z.object({_id: z.coerce.string(), name: z.string()})
    })

export default MailboxUserSettingSchema;
export {MailboxUserSettingSchema, MailboxUserSettingBaseSchema}
