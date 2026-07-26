
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
import SessionEmailProvider from "../providers/SessionEmailProvider";

//Import EntityCrud Refs
import MailboxCrud from "./MailboxCrud";
import {UserCrud} from "@drax/identity-vue"

class SessionEmailCrud extends EntityCrud implements IEntityCrud {

  static singleton: SessionEmailCrud
  private store

  constructor() {
    super();
    this.name = 'SessionEmail'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): SessionEmailCrud {
    if(!SessionEmailCrud.singleton){
      SessionEmailCrud.singleton = new SessionEmailCrud()
    }
    return SessionEmailCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'sessionemail:manage', 
      view: 'sessionemail:view', 
      create: 'sessionemail:create', 
      update: 'sessionemail:update', 
      delete: 'sessionemail:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'mailbox',key:'mailbox', align: 'start'},
{title: 'user',key:'user', align: 'start'},
{title: 'status',key:'status', align: 'start'},
{title: 'startedAt',key:'startedAt', align: 'start'},
{title: 'lastActivityAt',key:'lastActivityAt', align: 'start'},
{title: 'maxAssignableEmails',key:'maxAssignableEmails', align: 'start'},
{title: 'assignedCount',key:'assignedCount', align: 'start'},
{title: 'repliedCount',key:'repliedCount', align: 'start'},
{title: 'closedCount',key:'closedCount', align: 'start'}
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
    return SessionEmailProvider.instance
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
user: [(v: any) => !!v || 'validation.required'],
status: [(v: any) => !!v || 'validation.required'],
startedAt: [(v: any) => !!v || 'validation.required'],
maxAssignableEmails: [(v: any) => !!v || 'validation.required'],
assignedCount: [(v: any) => !!v || 'validation.required'],
repliedCount: [(v: any) => !!v || 'validation.required'],
closedCount: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'mailbox',type:'ref',label:'mailbox',default:null,ref: 'Mailbox',refDisplay: 'name'},
{name:'user',type:'ref',label:'user',default:null,ref: 'User',refDisplay: 'name'},
{name:'status',type:'enum',label:'status',default:'ACTIVE',enum: ['ACTIVE', 'PAUSED', 'CLOSED']},
{name:'startedAt',type:'date',label:'startedAt',default:null},
{name:'pausedAt',type:'date',label:'pausedAt',default:null},
{name:'endedAt',type:'date',label:'endedAt',default:null},
{name:'lastActivityAt',type:'date',label:'lastActivityAt',default:null},
{name:'maxAssignableEmails',type:'number',label:'maxAssignableEmails',default:0},
{name:'assignedCount',type:'number',label:'assignedCount',default:0},
{name:'repliedCount',type:'number',label:'repliedCount',default:0},
{name:'closedCount',type:'number',label:'closedCount',default:0},
{name:'capacityFillLockedUntil',type:'date',label:'capacityFillLockedUntil',default:null}
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

export default SessionEmailCrud

