import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";
import type {SessionEmailState} from "@/modules/mail/interfaces/ISessionEmail";

class SessionEmailProvider {
  static singleton: SessionEmailProvider
  httpClient: IHttpClient

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!SessionEmailProvider.singleton) {
      SessionEmailProvider.singleton = new SessionEmailProvider()
    }
    return SessionEmailProvider.singleton
  }

  async current(mailboxId: string): Promise<SessionEmailState> {
    return await this.httpClient.get(`/api/mailboxes/${mailboxId}/session-email/current`) as SessionEmailState
  }

  async start(mailboxId: string): Promise<SessionEmailState> {
    return await this.httpClient.post(`/api/mailboxes/${mailboxId}/session-email/start`, {}) as SessionEmailState
  }

  async pause(sessionId: string): Promise<SessionEmailState> {
    return await this.httpClient.post(`/api/session-email/${sessionId}/pause`, {}) as SessionEmailState
  }

  async resume(sessionId: string): Promise<SessionEmailState> {
    return await this.httpClient.post(`/api/session-email/${sessionId}/resume`, {}) as SessionEmailState
  }

  async close(sessionId: string): Promise<SessionEmailState> {
    return await this.httpClient.post(`/api/session-email/${sessionId}/close`, {}) as SessionEmailState
  }

  async closeBySupervisor(sessionId: string): Promise<SessionEmailState> {
    return await this.httpClient.post(`/api/session-email/${sessionId}/supervisor-close`, {}) as SessionEmailState
  }
}

export default SessionEmailProvider
