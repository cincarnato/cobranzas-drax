
import type {IMailboxUserSetting, IMailboxUserSettingBase} from './IMailboxUserSetting'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IMailboxUserSettingRepository extends IDraxCrudRepository<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase>{

}

export {IMailboxUserSettingRepository}


