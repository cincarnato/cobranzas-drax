import { z } from 'zod';
const CallFailedTypeBaseSchema = z.object({
    name: z.string().optional(),
    color: z.string().optional()
});
const CallFailedTypeSchema = CallFailedTypeBaseSchema
    .extend({
    _id: z.coerce.string(),
});
export default CallFailedTypeSchema;
export { CallFailedTypeSchema, CallFailedTypeBaseSchema };
