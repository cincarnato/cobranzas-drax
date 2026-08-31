
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
import {UserCrud} from "@drax/identity-vue";
import PayerCrud from "./PayerCrud";

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
      {title: 'status', key: 'status', align: 'start'},
      {title: 'aiStatus', key: 'aiStatus', align: 'start'},
      {title: 'humanStatus', key: 'humanStatus', align: 'start'},
      // {title: 'needsHumanReview', key: 'needsHumanReview', align: 'start'},
      {title: 'hasAdditionalInquiry', key: 'hasAdditionalInquiry', align: 'start'},
      {title: 'aiProcessedAt', key: 'aiProcessedAt', align: 'start'},
      {title: 'aiError', key: 'aiError', align: 'start'},
      {title: 'assignedTo', key: 'assignedTo', align: 'start'},
      {title: 'auditedBy', key: 'auditedBy', align: 'start'},
      {title: 'auditedAt', key: 'auditedAt', align: 'start'},
      {title: 'transferDate', key: 'transferDate', align: 'start'},

      {title: 'processDate', key: 'processDate', align: 'start'},
      {title: 'amount', key: 'amount', align: 'end'},
      {title: 'currency', key: 'currency', align: 'start'},

      {title: 'affiliateStrategy', key: 'affiliateStrategy', align: 'start'},
      {title: 'payer', key: 'payer', align: 'start'},
      {title: 'affiliates', key: 'affiliates', align: 'start'},

      {title: 'operationNumber', key: 'operationNumber', align: 'start'},
      {title: 'concept', key: 'concept', align: 'start'},

      {title: 'originName', key: 'originName', align: 'start'},
      {title: 'originAccount', key: 'originAccount', align: 'start'},
      {title: 'originCbu', key: 'originCbu', align: 'start'},
      {title: 'originAlias', key: 'originAlias', align: 'start'},
      {title: 'originBank', key: 'originBank', align: 'start'},

      {title: 'destinationName', key: 'destinationName', align: 'start'},
      {title: 'destinationAccount', key: 'destinationAccount', align: 'start'},
      {title: 'destinationCbu', key: 'destinationCbu', align: 'start'},
      {title: 'destinationAlias', key: 'destinationAlias', align: 'start'},
      {title: 'destinationBank', key: 'destinationBank', align: 'start'},

      {title: 'emailSubject', key: 'emailSubject', align: 'start'},
      {title: 'emailFromName', key: 'emailFromName', align: 'start'},
      {title: 'emailFromEmail', key: 'emailFromEmail', align: 'start'},
      {title: 'emailDate', key: 'emailDate', align: 'start'},
      {title: 'emailMessageId', key: 'emailMessageId', align: 'start'},
      {title: 'emailDocumentNumber', key: 'emailDocumentNumber', align: 'start'},


      {title: 'isTransferProof', key: 'isTransferProof', align: 'start'},
      {title: 'inboundEmail', key: 'inboundEmail', align: 'start'},
      {title: 'createdAt', key: 'createdAt', align: 'start'},
      {title: 'updatedAt', key: 'updatedAt', align: 'start'}
    ]
  }

  get selectedHeaders(): string[] {
    return ['status','aiStatus','humanStatus', 'transferDate', 'amount', 'affiliateStrategy', 'payer', 'affiliates','emailFromEmail', 'emailDate']
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
      InboundEmail: InboundEmailCrud.instance,
      Payer: PayerCrud.instance,
      User: UserCrud.instance
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
{name:'originName',type:'string',label:'originName',default:''},
{name:'originAccount',type:'string',label:'originAccount',default:''},
{name:'originCbu',type:'string',label:'originCbu',default:''},
{name:'originAlias',type:'string',label:'originAlias',default:''},
{name:'originBank',type:'string',label:'originBank',default:''},
{name:'destinationName',type:'string',label:'destinationName',default:''},
{name:'destinationAccount',type:'string',label:'destinationAccount',default:''},
{name:'destinationCbu',type:'string',label:'destinationCbu',default:''},
{name:'destinationAlias',type:'string',label:'destinationAlias',default:''},
{name:'destinationBank',type:'string',label:'destinationBank',default:''},
{name:'affiliateStrategy',type:'enum',label:'affiliateStrategy',default:null,enum:['EMAIL_FROM', 'DNI_CUIL', 'CBU_CVU', 'NRO_CUENTA', 'EMAIL_DATA']},
{name:'payer',type:'ref',label:'payer',default:null,ref:'Payer',refDisplay:'value'},
        {name:'affiliates',type:'array.object',label:'affiliates',default:[],objectFields: [
  {name: 'name', type: 'string', label: 'name', default: ''},
  {name: 'email', type: 'string', label: 'email', default: ''},
  {name: 'amount', type: 'number', label: 'Monto afiliado', default: null},
  {name: 'documentNumber', type: 'string', label: 'documentNumber', default: ''},
  {name: 'month', type: 'select', label: 'Mes', default: null, items: [
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
  {name: 'observations', type: 'longString', label: 'Observaciones', default: ''}
]},
{name:'status',type:'enum',label:'status',default:'PENDIENTE_IA',enum:['PENDIENTE_IA', 'PENDIENTE_AUDITORIA', 'AUDITADO']},
{name:'aiStatus',type:'enum',label:'aiStatus',default:'PENDIENTE',enum:['PENDIENTE', 'PROCESADO_CONFIABLE', 'PROCESADO_CON_DUDAS', 'PROCESADO_INCOMPLETO', 'PROCESADO_SIN_IA', 'ERROR_PROCESAMIENTO']},
{name:'aiProcessedAt',type:'date',label:'aiProcessedAt',default:null},
{name:'aiError',type:'string',label:'aiError',default:''},
{name:'humanStatus',type:'enum',label:'humanStatus',default:'PENDIENTE',enum:['PENDIENTE', 'VALIDADO', 'CORREGIDO', 'DESCARTADO']},
{name:'assignedTo',type:'ref',label:'assignedTo',default:null,ref:'User',refDisplay:'username'},
{name:'auditedBy',type:'ref',label:'auditedBy',default:null,ref:'User',refDisplay:'username'},
{name:'auditedAt',type:'date',label:'auditedAt',default:null},
{name:'needsHumanReview',type:'boolean',label:'needsHumanReview',default:false},
{name:'hasAdditionalInquiry',type:'boolean',label:'hasAdditionalInquiry',default:false}
    ]
  }

  get filters():IEntityCrudFilter[]{
    return [
      {name: 'transferDate', type: 'date', label: 'Transferencia', default: '', operator: 'range' },
      {name: 'emailDate', type: 'date', label: 'Email', default: '', operator: 'range' },
      {name: 'auditedBy', type: 'ref', ref:'User', refDisplay:'username', label: 'Auditado Por', default: null, operator: 'eq' },
      {name: 'emailSubject', type: 'string', label: 'Asunto Mail', default: '', operator: 'like' },
      {name: 'emailFromEmail', type: 'string', label: 'Email Remitente', default: '', operator: 'like' },
      {name: 'originName', type: 'string', label: 'Titular origen', default: '', operator: 'like' },
      {name: 'emailDocumentNumber', type: 'string', label: 'DNI Email', default: '', operator: 'eq' },
      {name: 'affiliates.name', type: 'string', label: 'Nombre Afiliado', default: '', operator: 'like' },
      {name: 'affiliates.documentNumber', type: 'string', label: 'DNI Afiliado', default: '', operator: 'like' },
      {name: 'operationNumber', type: 'string', label: 'Número Operacion', default: '', operator: 'eq' },
      {name: 'status', type: 'enum', label: 'Estado general', default: '', operator: 'eq', enum: ['PENDIENTE_IA', 'PENDIENTE_AUDITORIA', 'AUDITADO'] },
      {name: 'aiStatus', type: 'enum', label: 'Estado IA', default: '', operator: 'eq', enum: ['PENDIENTE', 'PROCESADO_CONFIABLE', 'PROCESADO_CON_DUDAS', 'PROCESADO_INCOMPLETO', 'PROCESADO_SIN_IA', 'ERROR_PROCESAMIENTO'] },
      {name: 'humanStatus', type: 'enum', label: 'Estado auditoría', default: '', operator: 'eq', enum: ['PENDIENTE', 'VALIDADO', 'CORREGIDO', 'DESCARTADO'] },
      {name: 'hasAdditionalInquiry', type: 'boolean', label: 'Consulta adicional', default: null, operator: 'eq' },
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
    return ['_id','status','aiStatus','humanStatus','hasAdditionalInquiry','emailMessageId','emailSubject','emailFromName','emailFromEmail','emailDocumentNumber','affiliateStrategy','payer','affiliates', 'amount','currency', 'transferDate', 'emailDate', 'processDate', 'aiProcessedAt', 'originName', 'destinationName']
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
    return false
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
