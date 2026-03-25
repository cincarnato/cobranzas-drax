import {UserCrud, RoleCrud, TenantCrud} from "@drax/identity-vue"
import {FileEntityCrud} from "@drax/media-vue"
import { useEntityStore } from '@drax/crud-vue'
import CallFailedTypeCrud from '../modules/caller/cruds/CallFailedTypeCrud'
import CallListCrud from '../modules/caller/cruds/CallListCrud'
import CallLogCrud from '../modules/caller/cruds/CallLogCrud'
import CallSuccessTypeCrud from '../modules/caller/cruds/CallSuccessTypeCrud'
import CovenantCrud from '../modules/collections/cruds/CovenantCrud'
import GroupZoneCrud from '../modules/collections/cruds/GroupZoneCrud'

function setupEntities(){
  const entityStore = useEntityStore()
  entityStore.addEntity(UserCrud.instance)
  entityStore.addEntity(RoleCrud.instance)
  entityStore.addEntity(TenantCrud.instance)
  entityStore.addEntity(FileEntityCrud.instance)
  entityStore.addEntity(CallFailedTypeCrud.instance)
  entityStore.addEntity(CallListCrud.instance)
  entityStore.addEntity(CallLogCrud.instance)
  entityStore.addEntity(CallSuccessTypeCrud.instance)
  entityStore.addEntity(CovenantCrud.instance)
  entityStore.addEntity(GroupZoneCrud.instance)
  //TODO Add domain entities here...

}

export default setupEntities
