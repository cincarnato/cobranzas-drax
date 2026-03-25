
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
import CallSuccessTypeProvider from "../providers/CallSuccessTypeProvider";

//Import EntityCrud Refs


class CallSuccessTypeCrud extends EntityCrud implements IEntityCrud {

  static singleton: CallSuccessTypeCrud

  constructor() {
    super();
    this.name = 'CallSuccessType'
  }
  
  static get instance(): CallSuccessTypeCrud {
    if(!CallSuccessTypeCrud.singleton){
      CallSuccessTypeCrud.singleton = new CallSuccessTypeCrud()
    }
    return CallSuccessTypeCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'callsuccesstype:manage', 
      view: 'callsuccesstype:view', 
      create: 'callsuccesstype:create', 
      update: 'callsuccesstype:update', 
      delete: 'callsuccesstype:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'},
{title: 'color',key:'color', align: 'start'}
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
    return CallSuccessTypeProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'color',type:'string',label:'color',default:''}
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

export default CallSuccessTypeCrud

