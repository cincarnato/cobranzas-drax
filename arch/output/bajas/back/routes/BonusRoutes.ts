
import BonusController from "../controllers/BonusController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {BonusSchema, BonusBaseSchema} from '../schemas/BonusSchema.js'

async function BonusFastifyRoutes(fastify, options) {

    const controller: BonusController = new BonusController()
    const schemas = new CrudSchemaBuilder(BonusSchema, BonusBaseSchema,BonusBaseSchema, 'Bonus', 'openapi-3.0', ['Bajas']);

    fastify.get('/api/bonuses', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/bonuses/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/bonuses/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/bonuses/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/bonuses/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/bonuses/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/bonuses', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/bonuses/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/bonuses/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/bonuses/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/bonuses/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/bonuses/import', (req,rep) => controller.import(req,rep))
    
}

export default BonusFastifyRoutes;
export {BonusFastifyRoutes}
