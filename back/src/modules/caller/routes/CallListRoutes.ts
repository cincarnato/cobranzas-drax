
import CallListController from "../controllers/CallListController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {CallListSchema, CallListBaseSchema} from '../schemas/CallListSchema.js'

async function CallListFastifyRoutes(fastify, options) {

    const controller: CallListController = new CallListController()
    const schemas = new CrudSchemaBuilder(CallListSchema, CallListBaseSchema,CallListBaseSchema, 'CallList', 'openapi-3.0', ['CallList']);

    fastify.get('/api/call-lists', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/call-lists/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/call-lists/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/call-lists/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/call-lists/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/call-lists/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/call-lists', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/call-lists/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/call-lists/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/call-lists/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/call-lists/export', (req,rep) =>controller.export(req,rep))
    
}

export default CallListFastifyRoutes;
export {CallListFastifyRoutes}
