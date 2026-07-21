
import TypificationEmailController from "../controllers/TypificationEmailController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {TypificationEmailSchema, TypificationEmailBaseSchema} from '../schemas/TypificationEmailSchema.js'

async function TypificationEmailFastifyRoutes(fastify, options) {

    const controller: TypificationEmailController = new TypificationEmailController()
    const schemas = new CrudSchemaBuilder(TypificationEmailSchema, TypificationEmailBaseSchema,TypificationEmailBaseSchema, 'TypificationEmail', 'openapi-3.0', ['mail']);

    fastify.get('/api/typification-emails', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/typification-emails/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/typification-emails/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/typification-emails/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/typification-emails/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/typification-emails/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/typification-emails', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/typification-emails/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/typification-emails/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/typification-emails/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/typification-emails/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/typification-emails/import', (req,rep) => controller.import(req,rep))
    
}

export default TypificationEmailFastifyRoutes;
export {TypificationEmailFastifyRoutes}
