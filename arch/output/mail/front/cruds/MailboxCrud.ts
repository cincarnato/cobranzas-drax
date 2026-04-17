
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
import MailboxProvider from "../providers/MailboxProvider";

//Import EntityCrud Refs


class MailboxCrud extends EntityCrud implements IEntityCrud {

  static singleton: MailboxCrud
  private store

  constructor() {
    super();
    this.name = 'Mailbox'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): MailboxCrud {
    if(!MailboxCrud.singleton){
      MailboxCrud.singleton = new MailboxCrud()
    }
    return MailboxCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'mailbox:manage', 
      view: 'mailbox:view', 
      create: 'mailbox:create', 
      update: 'mailbox:update', 
      delete: 'mailbox:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'},
{title: 'email',key:'email', align: 'start'},
{title: 'username',key:'username', align: 'start'},
{title: 'isActive',key:'isActive', align: 'start'},
{title: 'autoProcessEnabled',key:'autoProcessEnabled', align: 'start'},
{title: 'processingProtocol',key:'processingProtocol', align: 'start'},
{title: 'processingIntervalMinutes',key:'processingIntervalMinutes', align: 'start'},
{title: 'imapEnabled',key:'imapEnabled', align: 'start'},
{title: 'imapHost',key:'imapHost', align: 'start'},
{title: 'imapPort',key:'imapPort', align: 'start'},
{title: 'imapTls',key:'imapTls', align: 'start'},
{title: 'popEnabled',key:'popEnabled', align: 'start'},
{title: 'popPort',key:'popPort', align: 'start'},
{title: 'popTls',key:'popTls', align: 'start'},
{title: 'smtpEnabled',key:'smtpEnabled', align: 'start'},
{title: 'smtpHost',key:'smtpHost', align: 'start'},
{title: 'smtpPort',key:'smtpPort', align: 'start'},
{title: 'smtpTls',key:'smtpTls', align: 'start'}
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
    return MailboxProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: any) => !!v || 'validation.required'],
email: [(v: any) => !!v || 'validation.required'],
username: [(v: any) => !!v || 'validation.required'],
password: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:'',groupTab: 'General'},
{name:'email',type:'string',label:'email',default:'',groupTab: 'General'},
{name:'username',type:'string',label:'username',default:'',groupTab: 'General'},
{name:'password',type:'password',label:'password',default:'',groupTab: 'General'},
{name:'isActive',type:'boolean',label:'isActive',default:true,groupTab: 'General'},
{name:'autoProcessEnabled',type:'boolean',label:'autoProcessEnabled',default:false,groupTab: 'Procesamiento'},
{name:'processingProtocol',type:'enum',label:'processingProtocol',default:'IMAP',groupTab: 'Procesamiento',enum: ['IMAP', 'POP']},
{name:'processingIntervalMinutes',type:'number',label:'processingIntervalMinutes',default:5,groupTab: 'Procesamiento'},
{name:'imapEnabled',type:'boolean',label:'imapEnabled',default:true,groupTab: 'IMAP'},
{name:'imapHost',type:'string',label:'imapHost',default:'mail.grupopremedic.com',groupTab: 'IMAP'},
{name:'imapPort',type:'number',label:'imapPort',default:993,groupTab: 'IMAP'},
{name:'imapTls',type:'boolean',label:'imapTls',default:true,groupTab: 'IMAP'},
{name:'popEnabled',type:'boolean',label:'popEnabled',default:false,groupTab: 'POP'},
{name:'popHost',type:'string',label:'popHost',default:'mail.grupopremedic.com',groupTab: 'POP'},
{name:'popPort',type:'number',label:'popPort',default:995,groupTab: 'POP'},
{name:'popTls',type:'boolean',label:'popTls',default:true,groupTab: 'POP'},
{name:'smtpEnabled',type:'boolean',label:'smtpEnabled',default:true,groupTab: 'SMTP'},
{name:'smtpHost',type:'string',label:'smtpHost',default:'mail.grupopremedic.com',groupTab: 'SMTP'},
{name:'smtpPort',type:'number',label:'smtpPort',default:465,groupTab: 'SMTP'},
{name:'smtpTls',type:'boolean',label:'smtpTls',default:true,groupTab: 'SMTP'}
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
     'General', 'IMAP', 'POP', 'SMTP', 'Procesamiento'
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

export default MailboxCrud

