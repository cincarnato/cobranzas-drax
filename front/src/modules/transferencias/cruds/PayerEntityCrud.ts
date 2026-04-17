
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
import PayerEntityProvider from "../providers/PayerEntityProvider";

//Import EntityCrud Refs
import AffiliateCrud from "../../premedic/cruds/AffiliateCrud";


class PayerEntityCrud extends EntityCrud implements IEntityCrud {

  static singleton: PayerEntityCrud

  constructor() {
    super();
    this.name = 'PayerEntity'
  }
  
  static get instance(): PayerEntityCrud {
    if(!PayerEntityCrud.singleton){
      PayerEntityCrud.singleton = new PayerEntityCrud()
    }
    return PayerEntityCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'payerentity:manage', 
      view: 'payerentity:view', 
      create: 'payerentity:create', 
      update: 'payerentity:update', 
      delete: 'payerentity:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'cuilCuit',key:'cuilCuit', align: 'start'},
{title: 'nombre',key:'nombre', align: 'start'},
{title: 'ultimaVezDetectado',key:'ultimaVezDetectado', align: 'start'}
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
    return PayerEntityProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Affiliate: AffiliateCrud.instance
    }
  }

  get rules():IEntityCrudRules{
    return {
      nombre: [(v: any) => !!v || 'validation.required'],
cuentas: [],
afiliados: []
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'cuilCuit',type:'string',label:'cuilCuit',default:''},
{name:'nombre',type:'string',label:'nombre',default:''},
{name:'cuentas',type:'array.object',label:'cuentas',default:[],objectFields: [{name:'numero',type:'string',label:'numero',default:''},
{name:'banco',type:'string',label:'banco',default:''}]},
{name:'afiliados',type:'array.object',label:'afiliados',default:[],objectFields: [{name:'afiliadoId',type:'ref',label:'afiliadoId',default:null,ref: 'Affiliate',refDisplay: 'nombre'},
{name:'relacion',type:'enum',label:'relacion',default:null,enum: ['titular', 'conyuge', 'familiar', 'empresa', 'tercero', 'otro']},
{name:'metodoMatch',type:'enum',label:'metodoMatch',default:null,enum: ['cuilCuit', 'cuenta+banco', 'nombre', 'manual']}]},
{name:'ultimaVezDetectado',type:'date',label:'ultimaVezDetectado',default:null}
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

export default PayerEntityCrud
