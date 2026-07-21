import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {IOutboundEmail} from "@/modules/mail/interfaces/IOutboundEmail";

export type MailReplyPayload = {
  subject: string
  bodyText?: string
  bodyHtml?: string
  toEmails: string[]
  ccEmails?: string[]
  bccEmails?: string[]
  closeAfterSend?: boolean
}

export type MailReplyResult = {
  inboundEmail: IInboundEmail
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
}

export default MailReplyProvider
