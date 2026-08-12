import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {IOutboundEmail, IOutboundEmailAttachment} from "@/modules/mail/interfaces/IOutboundEmail";

export type MailReplyPayload = {
  subject: string
  bodyText?: string
  bodyHtml?: string
  attachments?: IOutboundEmailAttachment[]
  toEmails: string[]
  ccEmails?: string[]
  bccEmails?: string[]
  closeAfterSend?: boolean
  closeReason?: string | null
}

export type MailReplyResult = {
  inboundEmail: IInboundEmail
  outboundEmail: IOutboundEmail
}

export type MailSendResult = {
  outboundEmail: IOutboundEmail
}

class MailReplyProvider {
  static singleton: MailReplyProvider

  httpClient: IHttpClient
  basePath = "/api/mail-replies"

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!MailReplyProvider.singleton) {
      MailReplyProvider.singleton = new MailReplyProvider()
    }
    return MailReplyProvider.singleton
  }

  async sendReply(inboundEmailId: string, payload: MailReplyPayload): Promise<MailReplyResult> {
    return await this.httpClient.post(
      `${this.basePath}/${inboundEmailId}/send`,
      payload,
      {timeout: 120000}
    ) as MailReplyResult
  }

  async sendForward(inboundEmailId: string, payload: MailReplyPayload): Promise<MailReplyResult> {
    return await this.httpClient.post(
      `${this.basePath}/${inboundEmailId}/forward`,
      payload,
      {timeout: 120000}
    ) as MailReplyResult
  }

  async sendNew(payload: MailReplyPayload & {mailboxId: string}): Promise<MailSendResult> {
    return await this.httpClient.post(
      `${this.basePath}/send`,
      payload,
      {timeout: 120000}
    ) as MailSendResult
  }
}

export default MailReplyProvider
