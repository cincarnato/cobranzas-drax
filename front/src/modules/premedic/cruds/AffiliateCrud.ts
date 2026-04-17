
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
import AffiliateProvider from "../providers/AffiliateProvider";

class AffiliateCrud extends EntityCrud implements IEntityCrud {

  static singleton: AffiliateCrud

  constructor() {
    super();
    this.name = 'Affiliate'
  }
  
  static get instance(): AffiliateCrud {
    if(!AffiliateCrud.singleton){
      AffiliateCrud.singleton = new AffiliateCrud()
    }
    return AffiliateCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'affiliate:manage', 
      view: 'affiliate:view', 
      create: 'affiliate:create', 
      update: 'affiliate:update', 
      delete: 'affiliate:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'apellidoNombre',key:'apellidoNombre', align: 'start'},
{title: 'dni',key:'dni', align: 'start'},
{title: 'cuilCuit',key:'cuilCuit', align: 'start'},
{title: 'tipo',key:'tipo', align: 'start'},
{title: 'titular',key:'titular', align: 'start'},
{title: 'titularDni',key:'titularDni', align: 'start'}
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
    return AffiliateProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Affiliate: AffiliateCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      apellidoNombre: [(v: any) => !!v || 'validation.required'],
dni: [(v: any) => !!v || 'validation.required'],
titularDni: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'apellidoNombre',type:'string',label:'apellidoNombre',default:''},
{name:'dni',type:'string',label:'dni',default:''},
{name:'cuilCuit',type:'string',label:'cuilCuit',default:''},
{name:'tipo',type:'string',label:'tipo',default:''},
{name:'titular',type:'ref',label:'titular',default:null,ref: 'Affiliate',refDisplay: 'apellidoNombre'},
{name:'titularDni',type:'string',label:'titularDni',default:''}
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

export default AffiliateCrud
