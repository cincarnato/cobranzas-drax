import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";
import type {
  EmailSupervisionAssignedEmail,
  EmailSupervisionDaily,
  EmailSupervisionLive,
  EmailSupervisionMonthly,
} from "@/modules/mail/interfaces/IEmailSupervision";

class EmailSupervisionProvider {
  static singleton: EmailSupervisionProvider
  httpClient: IHttpClient

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!EmailSupervisionProvider.singleton) {
      EmailSupervisionProvider.singleton = new EmailSupervisionProvider()
    }
    return EmailSupervisionProvider.singleton
  }

  async live(mailboxId: string, includeWithoutSession: boolean): Promise<EmailSupervisionLive> {
    return await this.httpClient.get(`/api/mailboxes/${mailboxId}/supervision/email/live`, {
      params: {includeWithoutSession},
    }) as EmailSupervisionLive
  }

  async daily(mailboxId: string, date: string): Promise<EmailSupervisionDaily> {
    return await this.httpClient.get(`/api/mailboxes/${mailboxId}/supervision/email/daily`, {
      params: {date},
    }) as EmailSupervisionDaily
  }

  async monthly(mailboxId: string, month: string): Promise<EmailSupervisionMonthly> {
    return await this.httpClient.get(`/api/mailboxes/${mailboxId}/supervision/email/monthly`, {
      params: {month},
    }) as EmailSupervisionMonthly
  }

  async assignedEmails(mailboxId: string, userId: string): Promise<EmailSupervisionAssignedEmail[]> {
    return await this.httpClient.get(`/api/mailboxes/${mailboxId}/supervision/email/operators/${userId}/assigned-emails`) as EmailSupervisionAssignedEmail[]
  }
}

export default EmailSupervisionProvider
