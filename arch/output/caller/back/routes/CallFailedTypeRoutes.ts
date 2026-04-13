
import CallFailedTypeController from "../controllers/CallFailedTypeController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {CallFailedTypeSchema, CallFailedTypeBaseSchema} from '../schemas/CallFailedTypeSchema.js'

async function CallFailedTypeFastifyRoutes(fastify, options) {

    const controller: CallFailedTypeController = new CallFailedTypeController()
    const schemas = new CrudSchemaBuilder(CallFailedTypeSchema, CallFailedTypeBaseSchema,CallFailedTypeBaseSchema, 'CallFailedType', 'openapi-3.0', ['CallFailedType']);

    fastify.get('/api/call-failed-types', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/call-failed-types/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/call-failed-types/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/call-failed-types/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/call-failed-types/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/call-failed-types/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/call-failed-types', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/call-failed-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/call-failed-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/call-failed-types/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/call-failed-types/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/call-failed-types/import', (req,rep) => controller.import(req,rep))
    
}

export default CallFailedTypeFastifyRoutes;
export {CallFailedTypeFastifyRoutes}
