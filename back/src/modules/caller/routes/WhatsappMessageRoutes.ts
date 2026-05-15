
import WhatsappMessageController from "../controllers/WhatsappMessageController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {WhatsappMessageSchema, WhatsappMessageBaseSchema} from '../schemas/WhatsappMessageSchema.js'

async function WhatsappMessageFastifyRoutes(fastify, options) {

    const controller: WhatsappMessageController = new WhatsappMessageController()
    const schemas = new CrudSchemaBuilder(WhatsappMessageSchema, WhatsappMessageBaseSchema,WhatsappMessageBaseSchema, 'WhatsappMessage', 'openapi-3.0', ['WhatsappMessage']);

    fastify.get('/api/whatsapp-messages', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/whatsapp-messages/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/whatsapp-messages/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/whatsapp-messages/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/whatsapp-messages/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/whatsapp-messages/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/whatsapp-messages', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/whatsapp-messages/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/whatsapp-messages/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/whatsapp-messages/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/whatsapp-messages/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/whatsapp-messages/import', (req,rep) => controller.import(req,rep))
    
}

export default WhatsappMessageFastifyRoutes;
export {WhatsappMessageFastifyRoutes}
