import TemplateEmailController from "../controllers/TemplateEmailController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { TemplateEmailSchema, TemplateEmailBaseSchema } from '../schemas/TemplateEmailSchema.js';
async function TemplateEmailFastifyRoutes(fastify, options) {
    const controller = new TemplateEmailController();
    const schemas = new CrudSchemaBuilder(TemplateEmailSchema, TemplateEmailBaseSchema, TemplateEmailBaseSchema, 'TemplateEmail', 'openapi-3.0', ['TemplateEmail']);
    fastify.get('/api/template-emails', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/template-emails/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/template-emails/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/template-emails/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/template-emails/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.get('/api/template-emails/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.post('/api/template-emails', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/template-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/template-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/template-emails/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/template-emails/export', (req, rep) => controller.export(req, rep));
    fastify.post('/api/template-emails/import', (req, rep) => controller.import(req, rep));
}
export default TemplateEmailFastifyRoutes;
export { TemplateEmailFastifyRoutes };
