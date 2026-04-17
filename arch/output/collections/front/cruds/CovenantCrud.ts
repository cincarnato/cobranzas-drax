
import {EntityCrud, useCrudStore} from "@drax/crud-vue";
import type{
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader, 
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import CovenantProvider from "../providers/CovenantProvider";

//Import EntityCrud Refs
import GroupCrud from "./GroupCrud";
import {UserCrud} from "@drax/identity-vue"
import {UserCrud} from "@drax/identity-vue"
import {UserCrud} from "@drax/identity-vue"

class CovenantCrud extends EntityCrud implements IEntityCrud {

  static singleton: CovenantCrud
  private store

  constructor() {
    super();
    this.name = 'Covenant'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): CovenantCrud {
    if(!CovenantCrud.singleton){
      CovenantCrud.singleton = new CovenantCrud()
    }
    return CovenantCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'covenant:manage', 
      view: 'covenant:view', 
      create: 'covenant:create', 
      update: 'covenant:update', 
      delete: 'covenant:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'date',key:'date', align: 'start'},
{title: 'since',key:'since', align: 'start'},
{title: 'until',key:'until', align: 'start'},
{title: 'month',key:'month', align: 'start'},
{title: 'fullname',key:'fullname', align: 'start'},
{title: 'dni',key:'dni', align: 'start'},
{title: 'amount',key:'amount', align: 'start'},
{title: 'group',key:'group', align: 'start'},
{title: 'status',key:'status', align: 'start'}
    ]
  }
  
  get selectedHeaders(): string[] {
    return this.headers.map(header => header.key)
  }
  
  get actionHeaders():IEntityCrudHeader[]{
    return [
      {
        title: 'action.actions',
        key: 'actions',
        sortable: false,
        align: 'center',
        minWidth: '190px',
        fixed: 'end'
      },
    ]
  }

  get provider(): IDraxCrudProvider<any, any, any>{
    return CovenantProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Group: GroupCrud.instance ,
User: UserCrud.instance ,
User: UserCrud.instance ,
User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      date: [(v: any) => !!v || 'validation.required'],
since: [(v: any) => !!v || 'validation.required'],
until: [(v: any) => !!v || 'validation.required'],
month: [(v: any) => !!v || 'validation.required'],
fullname: [(v: any) => !!v || 'validation.required'],
dni: [(v: any) => !!v || 'validation.required'],
locality: [(v: any) => !!v || 'validation.required'],
address: [(v: any) => !!v || 'validation.required'],
amount: [(v: any) => !!v || 'validation.required'],
group: [(v: any) => !!v || 'validation.required'],
createdBy: [(v: any) => !!v || 'validation.required'],
updatedBy: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'date',type:'date',label:'date',default:null},
{name:'link',type:'string',label:'link',default:''},
{name:'since',type:'string',label:'since',default:''},
{name:'until',type:'string',label:'until',default:''},
{name:'month',type:'string',label:'month',default:''},
{name:'fullname',type:'string',label:'fullname',default:''},
{name:'dni',type:'string',label:'dni',default:''},
{name:'locality',type:'string',label:'locality',default:''},
{name:'address',type:'string',label:'address',default:''},
{name:'amount',type:'number',label:'amount',default:null},
{name:'comment',type:'string',label:'comment',default:''},
{name:'group',type:'ref',label:'group',default:null,ref: 'Group',refDisplay: 'name'},
{name:'createdBy',type:'ref',label:'createdBy',default:null,ref: 'User',refDisplay: 'name'},
{name:'updatedBy',type:'ref',label:'updatedBy',default:null,ref: 'User',refDisplay: 'name'},
{name:'status',type:'string',label:'status',default:''},
{name:'refuseComment',type:'string',label:'refuseComment',default:''},
{name:'refuseBy',type:'ref',label:'refuseBy',default:null,ref: 'User',refDisplay: 'name'}
    ]
  }
  
  get filters():IEntityCrudFilter[]{
    return [
      //{name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
    ]
  }
  
  get isViewable(){
    return true
  }

  get isEditable(){
    return true
  }

  get isCreatable(){
    return true
  }

  get isDeletable(){
    return true
  }

  get isExportable(){
    return true
  }

  get exportFormats(){
    return ['CSV', 'JSON']
  }

  get exportHeaders(){
    return ['_id']
  }

  get isImportable(){
    return false
  }
  
  get isColumnSelectable() {
    return true
  }

  get isGroupable() {
    return true
  }

  get importFormats(){
    return ['CSV', 'JSON']
  }

  get dialogFullscreen(){
    return false
  }
  
  get tabs() {
    return [
     
    ]
  }
  
  get menus() {
    return [
     
    ]
  }
  
  get searchEnable() {
    return true
  }

   get filtersEnable(){
    return true
  }

  get dynamicFiltersEnable(){
    return true
  }


}

export default CovenantCrud

