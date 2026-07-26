
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
import InternalTransferBonusProvider from "../providers/InternalTransferBonusProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class InternalTransferBonusCrud extends EntityCrud implements IEntityCrud {

  static singleton: InternalTransferBonusCrud
  private store

  constructor() {
    super();
    this.name = 'InternalTransferBonus'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): InternalTransferBonusCrud {
    if(!InternalTransferBonusCrud.singleton){
      InternalTransferBonusCrud.singleton = new InternalTransferBonusCrud()
    }
    return InternalTransferBonusCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'internaltransferbonus:manage', 
      view: 'internaltransferbonus:view', 
      create: 'internaltransferbonus:create', 
      update: 'internaltransferbonus:update', 
      delete: 'internaltransferbonus:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'dni',key:'dni', align: 'start'},
{title: 'fullname',key:'fullname', align: 'start'},
{title: 'appliedMonth',key:'appliedMonth', align: 'start'},
{title: 'bonifiedValue',key:'bonifiedValue', align: 'start'},
{title: 'bonusType',key:'bonusType', align: 'start'},
{title: 'bankDataAttachment',key:'bankDataAttachment', align: 'start'},
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
    return InternalTransferBonusProvider.instance
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
appliedMonth: [(v: any) => !!v || 'validation.required'],
bonifiedValue: [(v: any) => !!v || 'validation.required'],
bonusType: [(v: any) => !!v || 'validation.required'],
status: [(v: any) => !!v || 'validation.required'],
createdBy: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'dni',type:'string',label:'dni',default:''},
{name:'fullname',type:'string',label:'fullname',default:''},
{name:'appliedMonth',type:'string',label:'appliedMonth',default:''},
{name:'bonifiedValue',type:'number',label:'bonifiedValue',default:null},
{name:'bonusType',type:'enum',label:'bonusType',default:null,enum: ['Crédito en Cuenta Corriente', 'Transferencia Bancaria']},
{name:'bankDataAttachment',type:'fullFile',label:'bankDataAttachment',default:{}},
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

export default InternalTransferBonusCrud

