
import {EntityCrud} from "@drax/crud-vue";
import type{
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules,
  IEntityCrudOperation
} from "@drax/crud-share";
import TransferEmailProvider from "../providers/TransferEmailProvider";

//Import EntityCrud Refs
import InboundEmailCrud from "../../mail/cruds/InboundEmailCrud";

class TransferEmailCrud extends EntityCrud implements IEntityCrud {

  static singleton: TransferEmailCrud

  constructor() {
    super();
    this.name = 'TransferEmail'
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
      {title: '_id', key: '_id', align: 'start'},
      {title: 'needsHumanReview', key: 'needsHumanReview', align: 'start'},
      {title: 'transferDate', key: 'transferDate', align: 'start'},
      {title: 'emailDate', key: 'emailDate', align: 'start'},
      {title: 'processDate', key: 'processDate', align: 'start'},
      {title: 'amount', key: 'amount', align: 'end'},
      {title: 'currency', key: 'currency', align: 'start'},
      {title: 'emailDocumentNumber', key: 'emailDocumentNumber', align: 'start'},

      {title: 'affiliateStrategy', key: 'affiliateStrategy', align: 'start'},
      {title: 'affiliateName', key: 'affiliateName', align: 'start'},
      {title: 'affiliateDocumentNumber', key: 'affiliateDocumentNumber', align: 'start'},
      {title: 'affiliateEmail', key: 'affiliateEmail', align: 'start'},
      {title: 'additionalAffiliates', key: 'additionalAffiliates', align: 'start'},

      {title: 'month', key: 'month', align: 'start'},
      {title: 'observations', key: 'observations', align: 'start'},

      {title: 'operationNumber', key: 'operationNumber', align: 'start'},
      {title: 'concept', key: 'concept', align: 'start'},

      {title: 'originAccount', key: 'originAccount', align: 'start'},
      {title: 'originCbu', key: 'originCbu', align: 'start'},
      {title: 'originAlias', key: 'originAlias', align: 'start'},
      {title: 'originBank', key: 'originBank', align: 'start'},

      {title: 'destinationAccount', key: 'destinationAccount', align: 'start'},
      {title: 'destinationCbu', key: 'destinationCbu', align: 'start'},
      {title: 'destinationAlias', key: 'destinationAlias', align: 'start'},
      {title: 'destinationBank', key: 'destinationBank', align: 'start'},

      {title: 'emailSubject', key: 'emailSubject', align: 'start'},
      {title: 'emailFromName', key: 'emailFromName', align: 'start'},
      {title: 'emailFromEmail', key: 'emailFromEmail', align: 'start'},
      {title: 'emailMessageId', key: 'emailMessageId', align: 'start'},

      {title: 'isTransferProof', key: 'isTransferProof', align: 'start'},
      {title: 'inboundEmail', key: 'inboundEmail', align: 'start'},
      {title: 'createdAt', key: 'createdAt', align: 'start'},
      {title: 'updatedAt', key: 'updatedAt', align: 'start'}
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
{name:'emailMessageId',type:'string',label:'emailMessageId',default:''},
{name:'emailSubject',type:'string',label:'emailSubject',default:''},
{name:'emailFromName',type:'string',label:'emailFromName',default:''},
{name:'emailFromEmail',type:'string',label:'emailFromEmail',default:''},
{name:'emailDocumentNumber',type:'string',label:'emailDocumentNumber',default:''},
{name:'isTransferProof',type:'boolean',label:'isTransferProof',default:false},
{name:'amount',type:'number',label:'amount',default:null},
{name:'currency',type:'enum',label:'currency',default:null,enum: ['ARS', 'USD', 'EUR', 'OTHER']},
{name:'transferDate',type:'date',label:'transferDate',default:null},
{name:'emailDate',type:'date',label:'emailDate',default:null},
{name:'processDate',type:'date',label:'processDate',default:null},
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
{name:'additionalAffiliates',type:'array.object',label:'additionalAffiliates',default:[],objectFields: [
  {name: 'name', type: 'string', label: 'name', default: ''},
  {name: 'email', type: 'string', label: 'email', default: ''},
  {name: 'documentNumber', type: 'string', label: 'documentNumber', default: ''}
]},
{name:'month',type:'select',label:'month',default:null,items: [
  {title: 'Enero', value: 'Enero'},
  {title: 'Febrero', value: 'Febrero'},
  {title: 'Marzo', value: 'Marzo'},
  {title: 'Abril', value: 'Abril'},
  {title: 'Mayo', value: 'Mayo'},
  {title: 'Junio', value: 'Junio'},
  {title: 'Julio', value: 'Julio'},
  {title: 'Agosto', value: 'Agosto'},
  {title: 'Septiembre', value: 'Septiembre'},
  {title: 'Octubre', value: 'Octubre'},
  {title: 'Noviembre', value: 'Noviembre'},
  {title: 'Diciembre', value: 'Diciembre'}
]},
{name:'observations',type:'longString',label:'observations',default:''},
{name:'needsHumanReview',type:'boolean',label:'needsHumanReview',default:false}
    ]
  }

  get filters():IEntityCrudFilter[]{
    return [
      {name: 'transferDate', type: 'date', label: 'Fecha mayor a', default: '', operator: 'gte' },
      {name: 'transferDate', type: 'date', label: 'Fecha menor a', default: '', operator: 'lte' },
      {name: 'emailDate', type: 'date', label: 'Fecha email mayor a', default: '', operator: 'gte' },
      {name: 'emailDate', type: 'date', label: 'Fecha email menor a', default: '', operator: 'lte' },
      {name: 'emailSubject', type: 'string', label: 'Asunto Mail', default: '', operator: 'like' },
      {name: 'emailFromEmail', type: 'string', label: 'Email Remitente', default: '', operator: 'like' },
      {name: 'emailDocumentNumber', type: 'string', label: 'DNI Email', default: '', operator: 'eq' },
      {name: 'affiliateName', type: 'string', label: 'Nombre Afiliado', default: '', operator: 'like' },
      {name: 'affiliateDocumentNumber', type: 'string', label: 'DNI Afiliado', default: '', operator: 'eq' },
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
    return ['_id','emailMessageId','emailSubject','emailFromName','emailFromEmail','emailDocumentNumber','affiliateName','affiliateDocumentNumber','additionalAffiliates', 'amount','currency', 'transferDate', 'emailDate', 'processDate', 'month', 'observations']
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
    return true
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

  get navigationOperations(): IEntityCrudOperation[]{
    return ["view","edit"]
  }

  get containerFluid():boolean{
    return true
  }

}

export default TransferEmailCrud
