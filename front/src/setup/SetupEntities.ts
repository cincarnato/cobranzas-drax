import {UserCrud, RoleCrud, TenantCrud} from "@drax/identity-vue"
import { useEntityStore } from '@drax/crud-vue'
import CovenantCrud from '../modules/collections/cruds/CovenantCrud'
import GroupZoneCrud from '../modules/collections/cruds/GroupZoneCrud'

function setupEntities(){
  const entityStore = useEntityStore()
  entityStore.addEntity(UserCrud.instance)
  entityStore.addEntity(RoleCrud.instance)
  entityStore.addEntity(TenantCrud.instance)
  entityStore.addEntity(CovenantCrud.instance)
  entityStore.addEntity(GroupZoneCrud.instance)
  //TODO Add domain entities here...

}

export default setupEntities
