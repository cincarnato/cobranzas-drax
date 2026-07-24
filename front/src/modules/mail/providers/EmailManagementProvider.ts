import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";
import type {
  EmailManagementDetail,
  EmailManagementFilters,
  EmailManagementListResult,
  EmailManagementView,
} from "@/modules/mail/interfaces/IEmailManagement";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {IEmailUserState} from "@/modules/mail/interfaces/IEmailUserState";

type ListParams = EmailManagementFilters & {
  mailboxId?: string
  view: EmailManagementView
  search?: string
  page: number
  pageSize: number
}

class EmailManagementProvider {
  static singleton: EmailManagementProvider
  httpClient: IHttpClient
  basePath = "/api/inbound-emails"

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!EmailManagementProvider.singleton) {
      EmailManagementProvider.singleton = new EmailManagementProvider()
    }
    return EmailManagementProvider.singleton
  }

  async list(params: ListParams): Promise<EmailManagementListResult> {
    return await this.httpClient.get(`${this.basePath}/management`, {params: this.cleanParams(params)}) as EmailManagementListResult
  }

  async detail(id: string): Promise<EmailManagementDetail> {
    return await this.httpClient.get(`${this.basePath}/${id}/management-detail`) as EmailManagementDetail
  }

  async assignToMe(id: string, options: {force?: boolean} = {}): Promise<IInboundEmail> {
    return await this.httpClient.post(`${this.basePath}/${id}/assign-to-me`, options) as IInboundEmail
  }

  async reassign(id: string, assignedTo: string | null): Promise<IInboundEmail> {
    return await this.httpClient.patch(`${this.basePath}/${id}/assignment`, {assignedTo}) as IInboundEmail
  }

  async updateClassification(id: string, payload: {category?: string | null, priority?: string | null, sentiment?: string | null, tags?: string[]}): Promise<IInboundEmail> {
    return await this.httpClient.patch(`${this.basePath}/${id}/classification`, payload) as IInboundEmail
  }

  async close(id: string): Promise<IInboundEmail> {
    return await this.httpClient.post(`${this.basePath}/${id}/close`, {}) as IInboundEmail
  }

  async updateUserState(id: string, payload: {isRead?: boolean, isStarred?: boolean}): Promise<IEmailUserState> {
    return await this.httpClient.patch(`${this.basePath}/${id}/user-state`, payload) as IEmailUserState
  }

  private cleanParams(params: Record<string, any>) {
    const query: Record<string, any> = {}
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return
      query[key] = Array.isArray(value) ? value.join(",") : value
    })
    return query
  }
}

export default EmailManagementProvider
