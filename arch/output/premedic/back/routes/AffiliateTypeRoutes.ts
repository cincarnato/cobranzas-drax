
import AffiliateTypeController from "../controllers/AffiliateTypeController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {AffiliateTypeSchema, AffiliateTypeBaseSchema} from '../schemas/AffiliateTypeSchema.js'

async function AffiliateTypeFastifyRoutes(fastify, options) {

    const controller: AffiliateTypeController = new AffiliateTypeController()
    const schemas = new CrudSchemaBuilder(AffiliateTypeSchema, AffiliateTypeBaseSchema,AffiliateTypeBaseSchema, 'AffiliateType', 'openapi-3.0', ['premedic']);

    fastify.get('/api/affiliate-types', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/affiliate-types/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/affiliate-types/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/affiliate-types/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/affiliate-types/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/affiliate-types/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/affiliate-types', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/affiliate-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/affiliate-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/affiliate-types/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/affiliate-types/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/affiliate-types/import', (req,rep) => controller.import(req,rep))
    
}

export default AffiliateTypeFastifyRoutes;
export {AffiliateTypeFastifyRoutes}
