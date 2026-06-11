import PayerController from "../controllers/PayerController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { PayerSchema, PayerBaseSchema } from '../schemas/PayerSchema.js';
async function PayerFastifyRoutes(fastify, options) {
    const controller = new PayerController();
    const schemas = new CrudSchemaBuilder(PayerSchema, PayerBaseSchema, PayerBaseSchema, 'Payer', 'openapi-3.0', ['Payer']);
    fastify.get('/api/payers', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/payers/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/payers/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/payers/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.get('/api/payers/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/payers/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.post('/api/payers', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/payers/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/payers/:id', { schema: schemas.updateSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/payers/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/payers/export', (req, rep) => controller.export(req, rep));
}
export default PayerFastifyRoutes;
export { PayerFastifyRoutes };
