import { z } from 'zod';
const EmailUserStateBaseSchema = z.object({
    inboundEmail: z.any(),
    user: z.any(),
    isRead: z.boolean().optional().default(false),
    readAt: z.date().optional().nullable(),
    isStarred: z.boolean().optional().default(false),
});
const EmailUserStateSchema = EmailUserStateBaseSchema.extend({
    _id: z.string(),
});
export default EmailUserStateSchema;
export { EmailUserStateSchema, EmailUserStateBaseSchema };
