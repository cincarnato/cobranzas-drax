import { z } from 'zod';
const WhatsappMessageBaseSchema = z.object({
    sentAt: z.coerce.date({ error: "validation.date" }),
    user: z.coerce.string().min(1, 'validation.required'),
    destinationNumber: z.string().min(1, 'validation.required'),
    template: z.string().min(1, 'validation.required')
});
const WhatsappMessageSchema = WhatsappMessageBaseSchema
    .extend({
    _id: z.coerce.string(),
    user: z.object({ _id: z.coerce.string(), name: z.string() })
});
export default WhatsappMessageSchema;
export { WhatsappMessageSchema, WhatsappMessageBaseSchema };
