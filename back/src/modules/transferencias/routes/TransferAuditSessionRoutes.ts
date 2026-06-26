import TransferAuditSessionController from "../controllers/TransferAuditSessionController.js";

async function TransferAuditSessionFastifyRoutes(fastify, options) {
    const controller = new TransferAuditSessionController()

    fastify.get('/api/transfer-audit-sessions/active', (req, rep) => controller.active(req as any, rep))
    fastify.post('/api/transfer-audit-sessions', (req, rep) => controller.create(req as any, rep))
    fastify.post('/api/transfer-audit-sessions/:sessionId/assignments', (req, rep) => controller.assignments(req as any, rep))
    fastify.post('/api/transfer-audit-sessions/:sessionId/heartbeat', (req, rep) => controller.heartbeat(req as any, rep))
    fastify.post('/api/transfer-audit-sessions/:sessionId/pause', (req, rep) => controller.pause(req as any, rep))
    fastify.post('/api/transfer-audit-sessions/:sessionId/resume', (req, rep) => controller.resume(req as any, rep))
    fastify.post('/api/transfer-audit-sessions/:sessionId/complete', (req, rep) => controller.complete(req as any, rep))
    fastify.get('/api/transfer-audit-sessions/:sessionId/items', (req, rep) => controller.items(req as any, rep))
}

export default TransferAuditSessionFastifyRoutes
export {TransferAuditSessionFastifyRoutes}
