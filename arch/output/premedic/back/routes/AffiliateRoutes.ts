
import AffiliateController from "../controllers/AffiliateController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {AffiliateSchema, AffiliateBaseSchema} from '../schemas/AffiliateSchema.js'

async function AffiliateFastifyRoutes(fastify, options) {

    const controller: AffiliateController = new AffiliateController()
    const schemas = new CrudSchemaBuilder(AffiliateSchema, AffiliateBaseSchema,AffiliateBaseSchema, 'Affiliate', 'openapi-3.0', ['premedic']);

    fastify.get('/api/affiliates', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/affiliates/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/affiliates/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/affiliates/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/affiliates/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/affiliates/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/affiliates', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/affiliates/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/affiliates/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/affiliates/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/affiliates/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/affiliates/import', (req,rep) => controller.import(req,rep))
    
}

export default AffiliateFastifyRoutes;
export {AffiliateFastifyRoutes}
