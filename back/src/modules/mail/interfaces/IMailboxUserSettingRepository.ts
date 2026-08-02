
import type {IMailboxUserSetting, IMailboxUserSettingBase} from './IMailboxUserSetting'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IMailboxUserSettingRepository extends IDraxCrudRepository<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase>{
    findByMailboxAndUser(mailboxId: string, userId: string): Promise<IMailboxUserSetting | null>
    upsertForMailboxAndUser(mailboxId: string, userId: string, data: Partial<IMailboxUserSettingBase>): Promise<IMailboxUserSetting>

}

export {IMailboxUserSettingRepository}

