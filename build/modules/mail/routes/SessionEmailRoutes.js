import SessionEmailController from "../controllers/SessionEmailController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { SessionEmailBaseSchema, SessionEmailSchema } from "../schemas/SessionEmailSchema.js";
async function SessionEmailFastifyRoutes(fastify, options) {
    const controller = new SessionEmailController();
    const schemas = new CrudSchemaBuilder(SessionEmailSchema, SessionEmailBaseSchema, SessionEmailBaseSchema, 'SessionEmail', 'openapi-3.0', ['mail']);
    fastify.get('/api/mailboxes/:mailboxId/session-email/current', (req, rep) => controller.current(req, rep));
    fastify.post('/api/mailboxes/:mailboxId/session-email/start', (req, rep) => controller.start(req, rep));
    fastify.post('/api/session-email/:sessionId/pause', (req, rep) => controller.pause(req, rep));
    fastify.post('/api/session-email/:sessionId/resume', (req, rep) => controller.resume(req, rep));
    fastify.post('/api/session-email/:sessionId/close', (req, rep) => controller.close(req, rep));
    fastify.post('/api/session-email/:sessionId/supervisor-close', (req, rep) => controller.closeBySupervisor(req, rep));
    fastify.get('/api/session-emails', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/session-emails/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/session-emails/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/session-emails/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.get('/api/session-emails/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/session-emails/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.post('/api/session-emails', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/session-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/session-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/session-emails/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/session-emails/export', (req, rep) => controller.export(req, rep));
}
export default SessionEmailFastifyRoutes;
export { SessionEmailFastifyRoutes };
