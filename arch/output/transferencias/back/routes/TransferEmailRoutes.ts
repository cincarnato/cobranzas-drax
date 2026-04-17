
import TransferEmailController from "../controllers/TransferEmailController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {TransferEmailSchema, TransferEmailBaseSchema} from '../schemas/TransferEmailSchema.js'

async function TransferEmailFastifyRoutes(fastify, options) {

    const controller: TransferEmailController = new TransferEmailController()
    const schemas = new CrudSchemaBuilder(TransferEmailSchema, TransferEmailBaseSchema,TransferEmailBaseSchema, 'TransferEmail', 'openapi-3.0', ['transferencias']);

    fastify.get('/api/transfer-emails', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/transfer-emails/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/transfer-emails/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/transfer-emails/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/transfer-emails/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/transfer-emails/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/transfer-emails', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/transfer-emails/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/transfer-emails/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/transfer-emails/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/transfer-emails/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/transfer-emails/import', (req,rep) => controller.import(req,rep))
    
}

export default TransferEmailFastifyRoutes;
export {TransferEmailFastifyRoutes}
