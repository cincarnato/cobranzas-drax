
import { z } from 'zod';


const CallSuccessTypeBaseSchema = z.object({
      name: z.string().optional(),
    color: z.string().optional()
});

const CallSuccessTypeSchema = CallSuccessTypeBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default CallSuccessTypeSchema;
export {CallSuccessTypeSchema, CallSuccessTypeBaseSchema}
