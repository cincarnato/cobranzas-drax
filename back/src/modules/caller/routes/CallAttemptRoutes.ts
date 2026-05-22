import CallAttemptController from "../controllers/CallAttemptController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {CallAttemptSchema, CallAttemptBaseSchema} from '../schemas/CallAttemptSchema.js'

async function CallAttemptFastifyRoutes(fastify, options) {

    const controller: CallAttemptController = new CallAttemptController()
    const schemas = new CrudSchemaBuilder(CallAttemptSchema, CallAttemptBaseSchema, CallAttemptBaseSchema, 'CallAttempt', 'openapi-3.0', ['CallAttempt']);

    fastify.get('/api/call-attempts', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/call-attempts/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))

    fastify.get('/api/call-attempts/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/call-attempts/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))

    fastify.get('/api/call-attempts/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.get('/api/call-attempts/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/call-attempts', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/call-attempts/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.patch('/api/call-attempts/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/call-attempts/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

    fastify.get('/api/call-attempts/export', (req,rep) =>controller.export(req,rep))

}

export default CallAttemptFastifyRoutes;
export {CallAttemptFastifyRoutes}
