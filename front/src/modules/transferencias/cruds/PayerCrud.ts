
import {EntityCrud} from "@drax/crud-vue";
import type{
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader, 
  IEntityCrudPermissions,
  IEntityCrudRules
} from "@drax/crud-share";
import PayerProvider from "../providers/PayerProvider";

class PayerCrud extends EntityCrud implements IEntityCrud {

  static singleton: PayerCrud

  constructor() {
    super();
    this.name = 'Payer'
  }
  
  static get instance(): PayerCrud {
    if(!PayerCrud.singleton){
      PayerCrud.singleton = new PayerCrud()
    }
    return PayerCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'payer:manage', 
      view: 'payer:view', 
      create: 'payer:create', 
      update: 'payer:update', 
      delete: 'payer:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'strategy', key: 'strategy', align: 'start'},
      {title: 'value', key: 'value', align: 'start'},
      {title: 'affiliateName', key: 'affiliateName', align: 'start'},
      {title: 'affiliateEmail', key: 'affiliateEmail', align: 'start'},
      {title: 'affiliateDocumentNumber', key: 'affiliateDocumentNumber', align: 'start'},
      {title: 'additionalAffiliates', key: 'additionalAffiliates', align: 'start'}
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
    return PayerProvider.instance
  }
  
  get rules():IEntityCrudRules{
    return {
      strategy: [(v: any) => !!v || 'validation.required'],
      value: [(v: any) => !!v || 'validation.required'],
      affiliateName: [],
      affiliateEmail: [],
      affiliateDocumentNumber: [],
      additionalAffiliates: []
    }
  }

  get fields(): IEntityCrudField[]{
    return [
      {name: 'strategy', type: 'enum', label: 'strategy', default: 'EMAIL', enum: ['EMAIL', 'DNI_CUIL', 'CBU_CVU', 'NRO_CUENTA']},
      {name: 'value', type: 'string', label: 'value', default: ''},
      {name: 'affiliateName', type: 'string', label: 'affiliateName', default: ''},
      {name: 'affiliateEmail', type: 'string', label: 'affiliateEmail', default: ''},
      {name: 'affiliateDocumentNumber', type: 'string', label: 'affiliateDocumentNumber', default: ''},
      {name: 'additionalAffiliates', type: 'array.object', label: 'additionalAffiliates', default: [], objectFields: [
        {name: 'name', type: 'string', label: 'name', default: ''},
        {name: 'email', type: 'string', label: 'email', default: ''},
        {name: 'documentNumber', type: 'string', label: 'documentNumber', default: ''}
      ]}
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

export default PayerCrud
