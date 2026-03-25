
import type{ICallLogRepository} from "../interfaces/ICallLogRepository";
import type {ICallLogBase, ICallLog} from "../interfaces/ICallLog";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {NotFoundError} from "@drax/common-back";
import CallListServiceFactory from "../factory/services/CallListServiceFactory.js";

type RegisterAttemptPayload = Pick<ICallLogBase, 'notes' | 'typification' | 'state' | 'promiseDate' | 'done'>

class CallLogService extends AbstractService<ICallLog, ICallLogBase, ICallLogBase> {


    constructor(CallLogRepository: ICallLogRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CallLogRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

    async registerAttempt(id: string, payload: RegisterAttemptPayload): Promise<ICallLog> {
        const currentCallLog = await this.findById(id);

        if (!currentCallLog) {
            throw new NotFoundError();
        }

        const currentAttempts = currentCallLog.attempts ?? 0;
        const nextAttempts = currentAttempts + 1;
        const state = payload.state ?? currentCallLog.state;
        const typification = state === 'promesa'
            ? (payload.typification?.trim() || 'Promesa de pago')
            : (payload.typification ?? '');
        const promiseDate = state === 'promesa'
            ? (payload.promiseDate ?? null)
            : null;

        const updatedCallLog = await this.updatePartial(id, {
            attempts: nextAttempts,
            notes: payload.notes ?? '',
            typification,
            state,
            promiseDate,
            done: payload.done ?? false
        });

        if (!updatedCallLog) {
            throw new NotFoundError();
        }

        const callListId = typeof currentCallLog.callList === 'object'
            ? currentCallLog.callList?._id
            : currentCallLog.callList;

        if (!callListId) {
            throw new Error('CallLog without callList');
        }

        const callListService = CallListServiceFactory.instance;
        const currentCallList = await callListService.findById(callListId);

        if (!currentCallList) {
            throw new NotFoundError();
        }

        const attemptsControl = [...(currentCallList.attemptsControl ?? [])];
        const attemptControlIndex = attemptsControl.findIndex(item => item.number === nextAttempts);

        if (attemptControlIndex === -1) {
            attemptsControl.push({
                number: nextAttempts,
                count: 1,
                success: state === 'exitosa' ? 1 : 0,
                promises: state === 'promesa' ? 1 : 0
            });
        } else {
            const attemptControl = attemptsControl[attemptControlIndex] ?? {};
            attemptsControl[attemptControlIndex] = {
                ...attemptControl,
                number: nextAttempts,
                count: (attemptControl.count ?? 0) + 1,
                success: (attemptControl.success ?? 0) + (state === 'exitosa' ? 1 : 0),
                promises: (attemptControl.promises ?? 0) + (state === 'promesa' ? 1 : 0)
            };
        }

        await callListService.updatePartial(callListId, {
            attempts: (currentCallList.attempts ?? 0) + 1,
            attemptsControl,
            failed: (currentCallList.failed ?? 0) + (state === 'fallida' ? 1 : 0),
            success: (currentCallList.success ?? 0) + (state === 'exitosa' ? 1 : 0),
            promises: (currentCallList.promises ?? 0) + (state === 'promesa' ? 1 : 0)
        });

        return updatedCallLog;
    }

}

export default CallLogService
export {CallLogService}
