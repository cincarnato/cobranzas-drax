
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IMailbox, IMailboxBase} from '../interfaces/IMailbox'

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

}

export default MailboxProvider

