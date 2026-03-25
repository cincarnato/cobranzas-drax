
import CallLogController from "../controllers/CallLogController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {CallLogSchema, CallLogBaseSchema} from '../schemas/CallLogSchema.js'

async function CallLogFastifyRoutes(fastify, options) {

    const controller: CallLogController = new CallLogController()
    const schemas = new CrudSchemaBuilder(CallLogSchema, CallLogBaseSchema,CallLogBaseSchema, 'CallLog', 'openapi-3.0', ['CallLog']);

    fastify.get('/api/call-logs', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/call-logs/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/call-logs/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/call-logs/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/call-logs/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/call-logs/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/call-logs', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.post(
      '/api/call-logs/:id/attempts',
      {
        schema: {
          tags: ['CallLog'],
          summary: 'Register a new call attempt and update call list counters',
          params: {
            type: 'object',
            required: ['id'],
            properties: { id: { type: 'string' } }
          },
          body: {
            type: 'object',
            additionalProperties: false,
            properties: {
              notes: { type: 'string' },
              typification: { type: 'string' },
              state: { type: 'string', enum: ['pendiente', 'intentada', 'fallida', 'promesa', 'exitosa'] },
              promiseDate: { type: 'string', format: 'date-time', nullable: true },
              done: { type: 'boolean' }
            }
          },
          response: {
            200: schemas.jsonEntitySchema,
            401: schemas.jsonErrorBodyResponse,
            403: schemas.jsonErrorBodyResponse,
            404: schemas.jsonErrorBodyResponse,
            422: schemas.jsonValidationErrorBodyResponse,
            500: schemas.jsonErrorBodyResponse
          }
        }
      },
      (req, rep) => controller.registerAttempt(req as any, rep)
    )

    fastify.put('/api/call-logs/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/call-logs/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/call-logs/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/call-logs/export', (req,rep) =>controller.export(req,rep))
    
}

export default CallLogFastifyRoutes;
export {CallLogFastifyRoutes}
