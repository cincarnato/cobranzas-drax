
import PayerEntityController from "../controllers/PayerEntityController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {PayerEntitySchema, PayerEntityBaseSchema} from '../schemas/PayerEntitySchema.js'

async function PayerEntityFastifyRoutes(fastify, options) {

    const controller: PayerEntityController = new PayerEntityController()
    const schemas = new CrudSchemaBuilder(PayerEntitySchema, PayerEntityBaseSchema,PayerEntityBaseSchema, 'PayerEntity', 'openapi-3.0', ['PayerEntity']);

    fastify.get('/api/payer-entities', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/payer-entities/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/payer-entities/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/payer-entities/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/payer-entities/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/payer-entities/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/payer-entities', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/payer-entities/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/payer-entities/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/payer-entities/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/payer-entities/export', (req,rep) =>controller.export(req,rep))
    
}

export default PayerEntityFastifyRoutes;
export {PayerEntityFastifyRoutes}
