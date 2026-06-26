import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITransferAuditSessionState} from "../interfaces/ITransferAuditSession";
import type {ITransferEmail} from "../interfaces/ITransferEmail";

class TransferAuditSessionProvider extends AbstractCrudRestProvider<any, any, any> {
  static singleton: TransferAuditSessionProvider

  constructor() {
    super('/api/transfer-audit-sessions')
  }

  static get instance() {
    if (!TransferAuditSessionProvider.singleton) {
      TransferAuditSessionProvider.singleton = new TransferAuditSessionProvider()
    }
    return TransferAuditSessionProvider.singleton
  }

  async active(): Promise<ITransferAuditSessionState> {
    return await this.httpClient.get('/api/transfer-audit-sessions/active') as ITransferAuditSessionState
  }

  async start(batchSize = 5): Promise<ITransferAuditSessionState> {
    return await this.httpClient.post('/api/transfer-audit-sessions', {batchSize}) as ITransferAuditSessionState
  }

  async requestMore(sessionId: string, batchSize = 5): Promise<ITransferAuditSessionState> {
    return await this.httpClient.post(`/api/transfer-audit-sessions/${sessionId}/assignments`, {batchSize}) as ITransferAuditSessionState
  }

  async heartbeat(sessionId: string): Promise<ITransferAuditSessionState> {
    return await this.httpClient.post(`/api/transfer-audit-sessions/${sessionId}/heartbeat`, {}) as ITransferAuditSessionState
  }

  async pause(sessionId: string): Promise<ITransferAuditSessionState> {
    return await this.httpClient.post(`/api/transfer-audit-sessions/${sessionId}/pause`, {}) as ITransferAuditSessionState
  }

  async resume(sessionId: string): Promise<ITransferAuditSessionState> {
    return await this.httpClient.post(`/api/transfer-audit-sessions/${sessionId}/resume`, {}) as ITransferAuditSessionState
  }

  async complete(sessionId: string): Promise<ITransferAuditSessionState> {
    return await this.httpClient.post(`/api/transfer-audit-sessions/${sessionId}/complete`, {}) as ITransferAuditSessionState
  }

  async items(sessionId: string): Promise<ITransferEmail[]> {
    return await this.httpClient.get(`/api/transfer-audit-sessions/${sessionId}/items`) as ITransferEmail[]
  }
}

export default TransferAuditSessionProvider
