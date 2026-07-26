
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
import OutboundEmailProvider from "../providers/OutboundEmailProvider";

//Import EntityCrud Refs
import InboundEmailCrud from "./InboundEmailCrud";
import MailboxCrud from "./MailboxCrud";
import {UserCrud} from "@drax/identity-vue"

class OutboundEmailCrud extends EntityCrud implements IEntityCrud {

  static singleton: OutboundEmailCrud
  private store

  constructor() {
    super();
    this.name = 'OutboundEmail'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): OutboundEmailCrud {
    if(!OutboundEmailCrud.singleton){
      OutboundEmailCrud.singleton = new OutboundEmailCrud()
    }
    return OutboundEmailCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'outboundemail:manage', 
      view: 'outboundemail:view', 
      create: 'outboundemail:create', 
      update: 'outboundemail:update', 
      delete: 'outboundemail:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'inboundEmail',key:'inboundEmail', align: 'start'},
{title: 'mailbox',key:'mailbox', align: 'start'},
{title: 'user',key:'user', align: 'start'},
{title: 'fromEmail',key:'fromEmail', align: 'start'},
{title: 'subject',key:'subject', align: 'start'},
{title: 'status',key:'status', align: 'start'},
{title: 'messageId',key:'messageId', align: 'start'},
{title: 'sentAt',key:'sentAt', align: 'start'},
{title: 'attempts',key:'attempts', align: 'start'}
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
    return OutboundEmailProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      InboundEmail: InboundEmailCrud.instance ,
Mailbox: MailboxCrud.instance ,
User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      inboundEmail: [(v: any) => !!v || 'validation.required'],
mailbox: [(v: any) => !!v || 'validation.required'],
fromEmail: [(v: any) => !!v || 'validation.required'],
toEmails: [(v: any) => !!v || 'validation.required'],
subject: [(v: any) => !!v || 'validation.required'],
status: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'inboundEmail',type:'ref',label:'inboundEmail',default:null,groupTab: 'General',ref: 'InboundEmail',refDisplay: 'messageId'},
{name:'mailbox',type:'ref',label:'mailbox',default:null,groupTab: 'General',ref: 'Mailbox',refDisplay: 'email'},
{name:'user',type:'ref',label:'user',default:null,groupTab: 'General',ref: 'User',refDisplay: 'name'},
{name:'fromEmail',type:'string',label:'fromEmail',default:'',groupTab: 'General'},
{name:'toEmails',type:'array.string',label:'toEmails',default:[],groupTab: 'Destinatarios'},
{name:'ccEmails',type:'array.string',label:'ccEmails',default:[],groupTab: 'Destinatarios'},
{name:'bccEmails',type:'array.string',label:'bccEmails',default:[],groupTab: 'Destinatarios'},
{name:'subject',type:'string',label:'subject',default:'',groupTab: 'Contenido'},
{name:'bodyText',type:'longString',label:'bodyText',default:'',groupTab: 'Contenido'},
{name:'bodyHtml',type:'longString',label:'bodyHtml',default:'',groupTab: 'Contenido'},
{name:'status',type:'enum',label:'status',default:'DRAFT',groupTab: 'Envio',enum: ['DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED']},
{name:'messageId',type:'string',label:'messageId',default:'',groupTab: 'Envio'},
{name:'inReplyTo',type:'string',label:'inReplyTo',default:'',groupTab: 'Envio'},
{name:'references',type:'array.string',label:'references',default:[],groupTab: 'Envio'},
{name:'sentAt',type:'date',label:'sentAt',default:null,groupTab: 'Envio'},
{name:'lastError',type:'longString',label:'lastError',default:'',groupTab: 'Envio'},
{name:'attempts',type:'number',label:'attempts',default:0,groupTab: 'Envio'}
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
     'General', 'Destinatarios', 'Contenido', 'Envio'
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

export default OutboundEmailCrud

