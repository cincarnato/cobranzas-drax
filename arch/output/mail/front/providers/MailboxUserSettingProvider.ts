
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IMailboxUserSetting, IMailboxUserSettingBase} from '../interfaces/IMailboxUserSetting'

class MailboxUserSettingProvider extends AbstractCrudRestProvider<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase> {
    
  static singleton: MailboxUserSettingProvider
    
  constructor() {
   super('/api/mailbox-user-settings')
  }
  
  static get instance() {
    if(!MailboxUserSettingProvider.singleton){
      MailboxUserSettingProvider.singleton = new MailboxUserSettingProvider()
    }
    return MailboxUserSettingProvider.singleton
  }

}

export default MailboxUserSettingProvider

