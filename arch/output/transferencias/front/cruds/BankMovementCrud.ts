
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
import BankMovementProvider from "../providers/BankMovementProvider";

//Import EntityCrud Refs
import PayerEntityCrud from "./PayerEntityCrud";
import AffiliateCrud from "./AffiliateCrud";

class BankMovementCrud extends EntityCrud implements IEntityCrud {

  static singleton: BankMovementCrud
  private store

  constructor() {
    super();
    this.name = 'BankMovement'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): BankMovementCrud {
    if(!BankMovementCrud.singleton){
      BankMovementCrud.singleton = new BankMovementCrud()
    }
    return BankMovementCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'bankmovement:manage', 
      view: 'bankmovement:view', 
      create: 'bankmovement:create', 
      update: 'bankmovement:update', 
      delete: 'bankmovement:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'Fecha',key:'Fecha', align: 'start'},
{title: 'Concepto',key:'Concepto', align: 'start'},
{title: 'NroCpbte',key:'NroCpbte', align: 'start'},
{title: 'Debito',key:'Debito', align: 'start'},
{title: 'Credito',key:'Credito', align: 'start'},
{title: 'Saldo',key:'Saldo', align: 'start'},
{title: 'Cod',key:'Cod', align: 'start'},
{title: 'fecha',key:'fecha', align: 'start'},
{title: 'importe',key:'importe', align: 'start'},
{title: 'direccion',key:'direccion', align: 'start'},
{title: 'tipoConcepto',key:'tipoConcepto', align: 'start'},
{title: 'bancoOrigen',key:'bancoOrigen', align: 'start'},
{title: 'cuilCuitPagador',key:'cuilCuitPagador', align: 'start'},
{title: 'nombrePagador',key:'nombrePagador', align: 'start'},
{title: 'numeroCuentaPagador',key:'numeroCuentaPagador', align: 'start'},
{title: 'pagadorDetectadoId',key:'pagadorDetectadoId', align: 'start'},
{title: 'afiliadoId',key:'afiliadoId', align: 'start'},
{title: 'estado',key:'estado', align: 'start'}
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
    return BankMovementProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      PayerEntity: PayerEntityCrud.instance ,
Affiliate: AffiliateCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'Fecha',type:'string',label:'Fecha',default:''},
{name:'Concepto',type:'string',label:'Concepto',default:''},
{name:'NroCpbte',type:'string',label:'NroCpbte',default:''},
{name:'Debito',type:'number',label:'Debito',default:0},
{name:'Credito',type:'number',label:'Credito',default:0},
{name:'Saldo',type:'number',label:'Saldo',default:null},
{name:'Cod',type:'string',label:'Cod',default:''},
{name:'fecha',type:'date',label:'fecha',default:null},
{name:'importe',type:'number',label:'importe',default:null},
{name:'direccion',type:'enum',label:'direccion',default:null,enum: ['credito', 'debito']},
{name:'tipoConcepto',type:'enum',label:'tipoConcepto',default:null,enum: ['VAR', 'FAC', 'CUO', 'EXP']},
{name:'bancoOrigen',type:'string',label:'bancoOrigen',default:''},
{name:'cuilCuitPagador',type:'string',label:'cuilCuitPagador',default:''},
{name:'nombrePagador',type:'string',label:'nombrePagador',default:''},
{name:'numeroCuentaPagador',type:'string',label:'numeroCuentaPagador',default:''},
{name:'pagadorDetectadoId',type:'ref',label:'pagadorDetectadoId',default:null,ref: 'PayerEntity',refDisplay: 'nombre'},
{name:'afiliadoId',type:'ref',label:'afiliadoId',default:null,ref: 'Affiliate',refDisplay: 'nombre'},
{name:'estado',type:'enum',label:'estado',default:'pendiente',enum: ['pendiente', 'asignado', 'manual', 'ignorado']}
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

export default BankMovementCrud

