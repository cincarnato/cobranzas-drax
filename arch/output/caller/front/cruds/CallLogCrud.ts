
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
import CallLogProvider from "../providers/CallLogProvider";

//Import EntityCrud Refs
import CallListCrud from "./CallListCrud";

class CallLogCrud extends EntityCrud implements IEntityCrud {

  static singleton: CallLogCrud
  private store

  constructor() {
    super();
    this.name = 'CallLog'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): CallLogCrud {
    if(!CallLogCrud.singleton){
      CallLogCrud.singleton = new CallLogCrud()
    }
    return CallLogCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'calllog:manage', 
      view: 'calllog:view', 
      create: 'calllog:create', 
      update: 'calllog:update', 
      delete: 'calllog:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'callList',key:'callList', align: 'start'},
{title: 'attempts',key:'attempts', align: 'start'},
{title: 'typification',key:'typification', align: 'start'},
{title: 'state',key:'state', align: 'start'},
{title: 'promiseDate',key:'promiseDate', align: 'start'},
{title: 'done',key:'done', align: 'start'}
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
    return CallLogProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      CallList: CallListCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      callList: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'callList',type:'ref',label:'callList',default:null,ref: 'CallList',refDisplay: 'name'},
{name:'attempts',type:'number',label:'attempts',default:0},
{name:'notes',type:'string',label:'notes',default:''},
{name:'typification',type:'string',label:'typification',default:''},
{name:'state',type:'enum',label:'state',default:'pendiente',enum: ['pendiente', 'intentada', 'fallida', 'promesa', 'exitosa']},
{name:'promiseDate',type:'date',label:'promiseDate',default:null},
{name:'done',type:'boolean',label:'done',default:false},
{name:'data',type:'record',label:'data',default:null}
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

export default CallLogCrud

