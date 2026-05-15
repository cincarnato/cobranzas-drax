
import {EntityCrud} from "@drax/crud-vue";
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
import WhatsappMessageProvider from "../providers/WhatsappMessageProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class WhatsappMessageCrud extends EntityCrud implements IEntityCrud {

  static singleton: WhatsappMessageCrud

  constructor() {
    super();
    this.name = 'WhatsappMessage'
  }
  
  static get instance(): WhatsappMessageCrud {
    if(!WhatsappMessageCrud.singleton){
      WhatsappMessageCrud.singleton = new WhatsappMessageCrud()
    }
    return WhatsappMessageCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'whatsappmessage:manage', 
      view: 'whatsappmessage:view', 
      create: 'whatsappmessage:create', 
      update: 'whatsappmessage:update', 
      delete: 'whatsappmessage:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'sentAt',key:'sentAt', align: 'start'},
{title: 'user',key:'user', align: 'start'},
{title: 'destinationNumber',key:'destinationNumber', align: 'start'},
{title: 'template',key:'template', align: 'start'}
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
    return WhatsappMessageProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      sentAt: [(v: any) => !!v || 'validation.required'],
user: [(v: any) => !!v || 'validation.required'],
destinationNumber: [(v: any) => !!v || 'validation.required'],
template: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'sentAt',type:'date',label:'sentAt',default:null},
{name:'user',type:'ref',label:'user',default:null,ref: 'User',refDisplay: 'name'},
{name:'destinationNumber',type:'string',label:'destinationNumber',default:''},
{name:'template',type:'string',label:'template',default:''}
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

export default WhatsappMessageCrud
