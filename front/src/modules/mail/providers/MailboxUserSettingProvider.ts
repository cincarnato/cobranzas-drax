
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

  async current(mailboxId: string): Promise<IMailboxUserSetting | null> {
    return await this.httpClient.get(`/api/mailboxes/${mailboxId}/user-settings/current`) as IMailboxUserSetting | null
  }

  async saveCurrent(mailboxId: string, data: Pick<IMailboxUserSettingBase, "signatureHtml" | "signatureText">): Promise<IMailboxUserSetting> {
    return await this.httpClient.put(`/api/mailboxes/${mailboxId}/user-settings/current`, data) as IMailboxUserSetting
  }

}

export default MailboxUserSettingProvider
