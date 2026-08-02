
import MailboxUserSettingController from "../controllers/MailboxUserSettingController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {MailboxUserSettingSchema, MailboxUserSettingBaseSchema} from '../schemas/MailboxUserSettingSchema.js'

async function MailboxUserSettingFastifyRoutes(fastify, options) {

    const controller: MailboxUserSettingController = new MailboxUserSettingController()
    const schemas = new CrudSchemaBuilder(MailboxUserSettingSchema, MailboxUserSettingBaseSchema,MailboxUserSettingBaseSchema, 'MailboxUserSetting', 'openapi-3.0', ['MailboxUserSetting']);

    fastify.get('/api/mailbox-user-settings', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/mailbox-user-settings/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/mailbox-user-settings/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/mailbox-user-settings/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/mailbox-user-settings/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/mailbox-user-settings/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/mailbox-user-settings', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/mailbox-user-settings/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/mailbox-user-settings/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/mailbox-user-settings/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/mailbox-user-settings/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/mailbox-user-settings/import', (req,rep) => controller.import(req,rep))
    
}

export default MailboxUserSettingFastifyRoutes;
export {MailboxUserSettingFastifyRoutes}
