
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
import AffiliateTypeProvider from "../providers/AffiliateTypeProvider";

//Import EntityCrud Refs


class AffiliateTypeCrud extends EntityCrud implements IEntityCrud {

  static singleton: AffiliateTypeCrud
  private store

  constructor() {
    super();
    this.name = 'AffiliateType'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): AffiliateTypeCrud {
    if(!AffiliateTypeCrud.singleton){
      AffiliateTypeCrud.singleton = new AffiliateTypeCrud()
    }
    return AffiliateTypeCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'affiliatetype:manage', 
      view: 'affiliatetype:view', 
      create: 'affiliatetype:create', 
      update: 'affiliatetype:update', 
      delete: 'affiliatetype:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'nombre',key:'nombre', align: 'start'},
{title: 'descripcion',key:'descripcion', align: 'start'}
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
    return AffiliateTypeProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      nombre: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'nombre',type:'string',label:'nombre',default:''},
{name:'descripcion',type:'string',label:'descripcion',default:''}
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

export default AffiliateTypeCrud

