
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
import MailboxUserSettingProvider from "../providers/MailboxUserSettingProvider";

//Import EntityCrud Refs
import MailboxCrud from "./MailboxCrud";
import {UserCrud} from "@drax/identity-vue"

class MailboxUserSettingCrud extends EntityCrud implements IEntityCrud {

  static singleton: MailboxUserSettingCrud

  constructor() {
    super();
    this.name = 'MailboxUserSetting'
  }
  
  static get instance(): MailboxUserSettingCrud {
    if(!MailboxUserSettingCrud.singleton){
      MailboxUserSettingCrud.singleton = new MailboxUserSettingCrud()
    }
    return MailboxUserSettingCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'mailboxusersetting:manage', 
      view: 'mailboxusersetting:view', 
      create: 'mailboxusersetting:create', 
      update: 'mailboxusersetting:update', 
      delete: 'mailboxusersetting:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'mailbox',key:'mailbox', align: 'start'},
{title: 'user',key:'user', align: 'start'}
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
    return MailboxUserSettingProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Mailbox: MailboxCrud.instance ,
User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      mailbox: [(v: any) => !!v || 'validation.required'],
user: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'mailbox',type:'ref',label:'mailbox',default:null,ref: 'Mailbox',refDisplay: 'name'},
{name:'user',type:'ref',label:'user',default:null,ref: 'User',refDisplay: 'name'},
{name:'signatureHtml',type:'longString',label:'signatureHtml',default:''},
{name:'signatureText',type:'longString',label:'signatureText',default:''},
{name:'autoAdvanceOnClose',type:'boolean',label:'autoAdvanceOnClose',default:false}
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

export default MailboxUserSettingCrud
