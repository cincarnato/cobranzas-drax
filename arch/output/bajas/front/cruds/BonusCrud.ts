
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
import BonusProvider from "../providers/BonusProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class BonusCrud extends EntityCrud implements IEntityCrud {

  static singleton: BonusCrud
  private store

  constructor() {
    super();
    this.name = 'Bonus'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): BonusCrud {
    if(!BonusCrud.singleton){
      BonusCrud.singleton = new BonusCrud()
    }
    return BonusCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'bonus:manage', 
      view: 'bonus:view', 
      create: 'bonus:create', 
      update: 'bonus:update', 
      delete: 'bonus:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'dni',key:'dni', align: 'start'},
{title: 'fullname',key:'fullname', align: 'start'},
{title: 'plan',key:'plan', align: 'start'},
{title: 'appliedMonth',key:'appliedMonth', align: 'start'},
{title: 'paymentMethod',key:'paymentMethod', align: 'start'},
{title: 'bonus',key:'bonus', align: 'start'},
{title: 'bonifiedNetValue',key:'bonifiedNetValue', align: 'start'},
{title: 'status',key:'status', align: 'start'},
{title: 'createdBy',key:'createdBy', align: 'start'}
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
    return BonusProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      dni: [(v: any) => !!v || 'validation.required'],
fullname: [(v: any) => !!v || 'validation.required'],
plan: [(v: any) => !!v || 'validation.required'],
appliedMonth: [(v: any) => !!v || 'validation.required'],
paymentMethod: [(v: any) => !!v || 'validation.required'],
bonus: [(v: any) => !!v || 'validation.required'],
bonifiedNetValue: [(v: any) => !!v || 'validation.required'],
status: [(v: any) => !!v || 'validation.required'],
createdBy: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'dni',type:'string',label:'dni',default:''},
{name:'fullname',type:'string',label:'fullname',default:''},
{name:'plan',type:'string',label:'plan',default:''},
{name:'appliedMonth',type:'string',label:'appliedMonth',default:''},
{name:'paymentMethod',type:'string',label:'paymentMethod',default:''},
{name:'bonus',type:'string',label:'bonus',default:''},
{name:'bonifiedNetValue',type:'number',label:'bonifiedNetValue',default:null},
{name:'status',type:'enum',label:'status',default:'Pendiente',enum: ['Pendiente', 'Aplicado', 'No aplicado']},
{name:'observation',type:'longString',label:'observation',default:''},
{name:'createdBy',type:'ref',label:'createdBy',default:null,ref: 'User',refDisplay: 'name'}
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

export default BonusCrud

