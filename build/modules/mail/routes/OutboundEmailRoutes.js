import OutboundEmailController from "../controllers/OutboundEmailController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { OutboundEmailSchema, OutboundEmailBaseSchema } from '../schemas/OutboundEmailSchema.js';
async function OutboundEmailFastifyRoutes(fastify, options) {
    const controller = new OutboundEmailController();
    const schemas = new CrudSchemaBuilder(OutboundEmailSchema, OutboundEmailBaseSchema, OutboundEmailBaseSchema, 'OutboundEmail', 'openapi-3.0', ['mail']);
    fastify.get('/api/outbound-emails', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/outbound-emails/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/outbound-emails/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/outbound-emails/standalone', (req, rep) => controller.standalone(req, rep));
    fastify.get('/api/outbound-emails/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.get('/api/outbound-emails/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/outbound-emails/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.post('/api/outbound-emails', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/outbound-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/outbound-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/outbound-emails/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/outbound-emails/export', (req, rep) => controller.export(req, rep));
    fastify.post('/api/outbound-emails/import', (req, rep) => controller.import(req, rep));
}
export default OutboundEmailFastifyRoutes;
export { OutboundEmailFastifyRoutes };
