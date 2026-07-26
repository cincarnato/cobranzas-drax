
import InternalTransferBonusController from "../controllers/InternalTransferBonusController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {InternalTransferBonusSchema, InternalTransferBonusBaseSchema} from '../schemas/InternalTransferBonusSchema.js'

async function InternalTransferBonusFastifyRoutes(fastify, options) {

    const controller: InternalTransferBonusController = new InternalTransferBonusController()
    const schemas = new CrudSchemaBuilder(InternalTransferBonusSchema, InternalTransferBonusBaseSchema,InternalTransferBonusBaseSchema, 'InternalTransferBonus', 'openapi-3.0', ['Traspasos Internos']);

    fastify.get('/api/internal-transfer-bonuses', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/internal-transfer-bonuses/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/internal-transfer-bonuses/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/internal-transfer-bonuses/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/internal-transfer-bonuses/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/internal-transfer-bonuses/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/internal-transfer-bonuses', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/internal-transfer-bonuses/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/internal-transfer-bonuses/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/internal-transfer-bonuses/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/internal-transfer-bonuses/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/internal-transfer-bonuses/import', (req,rep) => controller.import(req,rep))
    
}

export default InternalTransferBonusFastifyRoutes;
export {InternalTransferBonusFastifyRoutes}
