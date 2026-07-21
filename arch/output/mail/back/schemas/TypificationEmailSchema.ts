
import { z } from 'zod';


const TypificationEmailBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const TypificationEmailSchema = TypificationEmailBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default TypificationEmailSchema;
export {TypificationEmailSchema, TypificationEmailBaseSchema}
