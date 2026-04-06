import {UserCrud, RoleCrud, TenantCrud} from "@drax/identity-vue"
import {FileEntityCrud} from "@drax/media-vue"
import { useEntityStore } from '@drax/crud-vue'
import PadronCrud from '../modules/afilmed/cruds/PadronCrud'
import CallFailedTypeCrud from '../modules/caller/cruds/CallFailedTypeCrud'
import CallListCrud from '../modules/caller/cruds/CallListCrud'
import CallLogCrud from '../modules/caller/cruds/CallLogCrud'
import CallSuccessTypeCrud from '../modules/caller/cruds/CallSuccessTypeCrud'
import CovenantCrud from '../modules/collections/cruds/CovenantCrud'
import GroupZoneCrud from '../modules/collections/cruds/GroupZoneCrud'
import AffiliateCrud from '../modules/transferencias/cruds/AffiliateCrud'
import BankMovementCrud from '../modules/transferencias/cruds/BankMovementCrud'
import PayerEntityCrud from '../modules/transferencias/cruds/PayerEntityCrud'

function setupEntities(){
  const entityStore = useEntityStore()
  entityStore.addEntity(UserCrud.instance)
  entityStore.addEntity(RoleCrud.instance)
  entityStore.addEntity(TenantCrud.instance)
  entityStore.addEntity(FileEntityCrud.instance)
  entityStore.addEntity(PadronCrud.instance)
  entityStore.addEntity(CallFailedTypeCrud.instance)
  entityStore.addEntity(CallListCrud.instance)
  entityStore.addEntity(CallLogCrud.instance)
  entityStore.addEntity(CallSuccessTypeCrud.instance)
  entityStore.addEntity(CovenantCrud.instance)
  entityStore.addEntity(GroupZoneCrud.instance)
  entityStore.addEntity(AffiliateCrud.instance)
  entityStore.addEntity(BankMovementCrud.instance)
  entityStore.addEntity(PayerEntityCrud.instance)
  //TODO Add domain entities here...

}

export default setupEntities
