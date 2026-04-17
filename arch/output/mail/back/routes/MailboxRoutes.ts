
import MailboxController from "../controllers/MailboxController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {MailboxSchema, MailboxBaseSchema} from '../schemas/MailboxSchema.js'

async function MailboxFastifyRoutes(fastify, options) {

    const controller: MailboxController = new MailboxController()
    const schemas = new CrudSchemaBuilder(MailboxSchema, MailboxBaseSchema,MailboxBaseSchema, 'Mailbox', 'openapi-3.0', ['mail']);

    fastify.get('/api/mailboxes', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/mailboxes/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/mailboxes/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/mailboxes/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/mailboxes/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/mailboxes/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/mailboxes', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/mailboxes/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/mailboxes/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/mailboxes/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/mailboxes/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/mailboxes/import', (req,rep) => controller.import(req,rep))
    
}

export default MailboxFastifyRoutes;
export {MailboxFastifyRoutes}
