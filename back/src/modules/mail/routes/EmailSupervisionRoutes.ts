import EmailSupervisionController from "../controllers/EmailSupervisionController.js";

async function EmailSupervisionFastifyRoutes(fastify, options) {
    const controller = new EmailSupervisionController();

    fastify.get('/api/mailboxes/:mailboxId/supervision/email/live', (req, rep) => controller.live(req as any, rep));
    fastify.get('/api/mailboxes/:mailboxId/supervision/email/daily', (req, rep) => controller.daily(req as any, rep));
    fastify.get('/api/mailboxes/:mailboxId/supervision/email/monthly', (req, rep) => controller.monthly(req as any, rep));
    fastify.get('/api/mailboxes/:mailboxId/supervision/email/operators/:userId/assigned-emails', (req, rep) => controller.assignedEmails(req as any, rep));
}

export default EmailSupervisionFastifyRoutes;
export {EmailSupervisionFastifyRoutes};
