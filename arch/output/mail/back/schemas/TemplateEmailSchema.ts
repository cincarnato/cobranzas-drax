
import { z } from 'zod';


const TemplateEmailBaseSchema = z.object({
      mailbox: z.coerce.string().min(1,'validation.required'),
    name: z.string().min(1,'validation.required'),
    content: z.string().min(1,'validation.required')
});

const TemplateEmailSchema = TemplateEmailBaseSchema
    .extend({
      _id: z.coerce.string(),
       mailbox: z.object({_id: z.coerce.string(), name: z.string()})
    })

export default TemplateEmailSchema;
export {TemplateEmailSchema, TemplateEmailBaseSchema}
