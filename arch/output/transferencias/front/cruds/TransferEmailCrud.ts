
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
import TransferEmailProvider from "../providers/TransferEmailProvider";

//Import EntityCrud Refs
import InboundEmailCrud from "./InboundEmailCrud";

class TransferEmailCrud extends EntityCrud implements IEntityCrud {

  static singleton: TransferEmailCrud
  private store

  constructor() {
    super();
    this.name = 'TransferEmail'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): TransferEmailCrud {
    if(!TransferEmailCrud.singleton){
      TransferEmailCrud.singleton = new TransferEmailCrud()
    }
    return TransferEmailCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'transferemail:manage', 
      view: 'transferemail:view', 
      create: 'transferemail:create', 
      update: 'transferemail:update', 
      delete: 'transferemail:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'isTransferProof',key:'isTransferProof', align: 'start'},
{title: 'amount',key:'amount', align: 'start'},
{title: 'transferDate',key:'transferDate', align: 'start'},
{title: 'operationNumber',key:'operationNumber', align: 'start'},
{title: 'destinationAccount',key:'destinationAccount', align: 'start'},
{title: 'needsHumanReview',key:'needsHumanReview', align: 'start'}
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
    return TransferEmailProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      InboundEmail: InboundEmailCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'inboundEmail',type:'ref',label:'inboundEmail',default:null,ref: 'InboundEmail',refDisplay: 'messageId'},
{name:'isTransferProof',type:'boolean',label:'isTransferProof',default:false},
{name:'amount',type:'number',label:'amount',default:null},
{name:'currency',type:'enum',label:'currency',default:null,enum: ['ARS', 'USD', 'EUR', 'OTHER']},
{name:'transferDate',type:'date',label:'transferDate',default:null},
{name:'operationNumber',type:'string',label:'operationNumber',default:''},
{name:'concept',type:'string',label:'concept',default:''},
{name:'originAccount',type:'string',label:'originAccount',default:''},
{name:'originCbu',type:'string',label:'originCbu',default:''},
{name:'originAlias',type:'string',label:'originAlias',default:''},
{name:'originBank',type:'string',label:'originBank',default:''},
{name:'destinationAccount',type:'string',label:'destinationAccount',default:''},
{name:'destinationCbu',type:'string',label:'destinationCbu',default:''},
{name:'destinationAlias',type:'string',label:'destinationAlias',default:''},
{name:'destinationBank',type:'string',label:'destinationBank',default:''},
{name:'affiliateName',type:'string',label:'affiliateName',default:''},
{name:'affiliateEmail',type:'string',label:'affiliateEmail',default:''},
{name:'affiliateDocumentNumber',type:'string',label:'affiliateDocumentNumber',default:''},
{name:'needsHumanReview',type:'boolean',label:'needsHumanReview',default:false}
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

export default TransferEmailCrud

