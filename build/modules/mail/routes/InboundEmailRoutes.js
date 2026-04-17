import InboundEmailController from "../controllers/InboundEmailController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { InboundEmailSchema, InboundEmailBaseSchema } from '../schemas/InboundEmailSchema.js';
async function InboundEmailFastifyRoutes(fastify, options) {
    const controller = new InboundEmailController();
    const schemas = new CrudSchemaBuilder(InboundEmailSchema, InboundEmailBaseSchema, InboundEmailBaseSchema, 'InboundEmail', 'openapi-3.0', ['mail']);
    fastify.get('/api/inbound-emails', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/inbound-emails/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/inbound-emails/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/inbound-emails/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.get('/api/inbound-emails/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/inbound-emails/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.post('/api/inbound-emails', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/inbound-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/inbound-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/inbound-emails/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/inbound-emails/export', (req, rep) => controller.export(req, rep));
}
export default InboundEmailFastifyRoutes;
export { InboundEmailFastifyRoutes };
