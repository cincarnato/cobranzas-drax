import CallSuccessTypeController from "../controllers/CallSuccessTypeController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { CallSuccessTypeSchema, CallSuccessTypeBaseSchema } from '../schemas/CallSuccessTypeSchema.js';
async function CallSuccessTypeFastifyRoutes(fastify, options) {
    const controller = new CallSuccessTypeController();
    const schemas = new CrudSchemaBuilder(CallSuccessTypeSchema, CallSuccessTypeBaseSchema, CallSuccessTypeBaseSchema, 'CallSuccessType', 'openapi-3.0', ['CallSuccessType']);
    fastify.get('/api/call-success-types', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/call-success-types/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/call-success-types/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/call-success-types/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.get('/api/call-success-types/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/call-success-types/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.post('/api/call-success-types', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/call-success-types/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/call-success-types/:id', { schema: schemas.updateSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/call-success-types/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/call-success-types/export', (req, rep) => controller.export(req, rep));
}
export default CallSuccessTypeFastifyRoutes;
export { CallSuccessTypeFastifyRoutes };
