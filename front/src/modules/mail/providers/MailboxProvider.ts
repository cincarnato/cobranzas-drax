
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IMailbox, IMailboxBase} from '../interfaces/IMailbox'

type InboundEmailSyncResult = {
  processedMailboxes: number
  createdEmails: number
  fetchedEmails: number
  skippedEmails: number
  errors: Array<{
    mailboxId: string
    error: string
  }>
}

class MailboxProvider extends AbstractCrudRestProvider<IMailbox, IMailboxBase, IMailboxBase> {

  static singleton: MailboxProvider

  constructor() {
   super('/api/mailboxes')
  }

  static get instance() {
    if(!MailboxProvider.singleton){
      MailboxProvider.singleton = new MailboxProvider()
    }
    return MailboxProvider.singleton
  }

  async syncInboundEmails(): Promise<InboundEmailSyncResult> {
    return await this.httpClient.post('/api/inbound-email-mailbox/sync',{}, {timeout: 600000}) as InboundEmailSyncResult
  }

}

export default MailboxProvider
export type { InboundEmailSyncResult }
