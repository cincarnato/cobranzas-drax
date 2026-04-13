
import PadronController from "../controllers/PadronController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {PadronSchema, PadronBaseSchema} from '../schemas/PadronSchema.js'

async function PadronFastifyRoutes(fastify, options) {

    const controller: PadronController = new PadronController()
    const schemas = new CrudSchemaBuilder(PadronSchema, PadronBaseSchema,PadronBaseSchema, 'Padron', 'openapi-3.0', ['Padron']);

    fastify.get('/api/padrones', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/padrones/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/padrones/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/padrones/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/padrones/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/padrones/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/padrones', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/padrones/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/padrones/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/padrones/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/padrones/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/padrones/import', (req,rep) => controller.import(req,rep))
    
}

export default PadronFastifyRoutes;
export {PadronFastifyRoutes}
