
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
import TemplateEmailProvider from "../providers/TemplateEmailProvider";

//Import EntityCrud Refs
import MailboxCrud from "./MailboxCrud";

class TemplateEmailCrud extends EntityCrud implements IEntityCrud {

  static singleton: TemplateEmailCrud

  constructor() {
    super();
    this.name = 'TemplateEmail'
  }
  
  static get instance(): TemplateEmailCrud {
    if(!TemplateEmailCrud.singleton){
      TemplateEmailCrud.singleton = new TemplateEmailCrud()
    }
    return TemplateEmailCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'templateemail:manage', 
      view: 'templateemail:view', 
      create: 'templateemail:create', 
      update: 'templateemail:update', 
      delete: 'templateemail:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'mailbox',key:'mailbox', align: 'start'},
{title: 'name',key:'name', align: 'start'}
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
    return TemplateEmailProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Mailbox: MailboxCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      mailbox: [(v: any) => !!v || 'validation.required'],
name: [(v: any) => !!v || 'validation.required'],
content: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'mailbox',type:'ref',label:'mailbox',default:null,ref: 'Mailbox',refDisplay: 'name'},
{name:'name',type:'string',label:'name',default:''},
{name:'content',type:'longString',label:'content',default:''}
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

export default TemplateEmailCrud
