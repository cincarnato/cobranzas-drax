import TransferEmailController from "../controllers/TransferEmailController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { TransferEmailSchema, TransferEmailBaseSchema } from '../schemas/TransferEmailSchema.js';
async function TransferEmailFastifyRoutes(fastify, options) {
    const controller = new TransferEmailController();
    const schemas = new CrudSchemaBuilder(TransferEmailSchema, TransferEmailBaseSchema, TransferEmailBaseSchema, 'TransferEmail', 'openapi-3.0', ['transferencias']);
    fastify.get('/api/transfer-emails', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/transfer-emails/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/transfer-emails/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/transfer-emails/export-excel', (req, rep) => controller.exportExcel(req, rep));
    fastify.get('/api/transfer-emails/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.get('/api/transfer-emails/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/transfer-emails/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.post('/api/transfer-emails', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.post('/api/transfer-emails/process-inbound-emails', {
        schema: {
            tags: ["transferencias"],
            summary: "Run inbound transfer email processing manually",
            body: {
                type: "object",
                additionalProperties: false,
                properties: {
                    since: { type: ["string", "null"], format: "date-time" },
                    limit: { type: ["number", "string", "null"] },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        since: { type: ["string", "null"], format: "date-time" },
                        limit: { type: "number" },
                        scanned: { type: "number" },
                        created: { type: "number" },
                        skipped: { type: "number" },
                    },
                },
            },
        },
    }, (req, rep) => controller.processInboundEmails(req, rep));
    fastify.post('/api/transfer-emails/process-inbound-email', {
        schema: {
            tags: ["transferencias"],
            summary: "Process one inbound email as a transfer email",
            body: {
                type: "object",
                additionalProperties: false,
                required: ["inboundEmailId"],
                properties: {
                    inboundEmailId: { type: "string" },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        inboundEmailId: { type: "string" },
                        transferEmails: {
                            type: "array",
                            items: { type: "object", additionalProperties: true },
                        },
                        created: { type: "number" },
                        existing: { type: "number" },
                        skipped: { type: "boolean" },
                        reason: { type: "string" },
                        message: { type: "string" },
                        details: { type: "string" },
                    },
                },
            },
        },
    }, (req, rep) => controller.processInboundEmail(req, rep));
    fastify.post('/api/transfer-emails/:id/reprocess', {
        schema: {
            tags: ["transferencias"],
            summary: "Reprocess transfer email affiliate resolution using current payer mappings",
            params: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "string" },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        transferEmail: { type: "object", additionalProperties: true },
                        previousTransferEmail: { type: "object", additionalProperties: true },
                        updatedFields: { type: "object", additionalProperties: true },
                        changes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string" },
                                    label: { type: "string" },
                                    before: { type: "string" },
                                    after: { type: "string" },
                                },
                            },
                        },
                        changed: { type: "boolean" },
                        payerFound: { type: "boolean" },
                        payer: { type: "object", additionalProperties: true, nullable: true },
                        payerStrategy: { type: "string" },
                        previousAffiliateStrategy: { type: "string" },
                        currentAffiliateStrategy: { type: "string" },
                    },
                },
            },
        },
    }, (req, rep) => controller.reprocess(req, rep));
    fastify.post('/api/transfer-emails/:id/audit', {
        schema: {
            tags: ["transferencias"],
            summary: "Audit transfer email human adjustments",
            params: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "string" },
                },
            },
            body: {
                type: "object",
                additionalProperties: false,
                properties: {
                    amount: { type: ["number", "null"] },
                    transferDate: { type: ["string", "null"], format: "date-time" },
                    affiliates: {
                        type: "array",
                        items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                                name: { type: "string" },
                                email: { type: "string" },
                                amount: { type: "number" },
                                documentNumber: { type: "string" },
                                month: { type: "string" },
                                observations: { type: "string" },
                            },
                        },
                    },
                    humanStatus: { type: "string", enum: ["PENDIENTE", "VALIDADO", "CORREGIDO", "DESCARTADO"] },
                    auditSessionId: { type: ["string", "null"] },
                    closeInboundEmail: { type: "boolean" }
                },
            },
            response: {
                200: schemas.jsonEntitySchema,
                401: schemas.jsonErrorBodyResponse,
                403: schemas.jsonErrorBodyResponse,
                422: schemas.jsonValidationErrorBodyResponse,
                500: schemas.jsonErrorBodyResponse
            }
        },
    }, (req, rep) => controller.audit(req, rep));
    fastify.put('/api/transfer-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/transfer-emails/:id', { schema: schemas.updateSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/transfer-emails/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/transfer-emails/export', (req, rep) => controller.export(req, rep));
    fastify.post('/api/transfer-emails/import', (req, rep) => controller.import(req, rep));
}
export default TransferEmailFastifyRoutes;
export { TransferEmailFastifyRoutes };
