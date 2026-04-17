
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
import PadronProvider from "../providers/PadronProvider";

//Import EntityCrud Refs


class PadronCrud extends EntityCrud implements IEntityCrud {

  static singleton: PadronCrud

  constructor() {
    super();
    this.name = 'Padron'
    useCrudStore(this.name)
  }
  
  static get instance(): PadronCrud {
    if(!PadronCrud.singleton){
      PadronCrud.singleton = new PadronCrud()
    }
    return PadronCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'padron:manage', 
      view: 'padron:view', 
      create: 'padron:create', 
      update: 'padron:update', 
      delete: 'padron:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'origen',key:'origen', align: 'start'},
{title: 'ente',key:'ente', align: 'start'},
{title: 'contra',key:'contra', align: 'start'},
{title: 'ape_nom',key:'ape_nom', align: 'start'},
{title: 'cant_inte',key:'cant_inte', align: 'start'},
{title: 'plan_codi',key:'plan_codi', align: 'start'},
{title: 'domicilio',key:'domicilio', align: 'start'},
{title: 'loca',key:'loca', align: 'start'},
{title: 'tele',key:'tele', align: 'start'},
{title: 'deuda1',key:'deuda1', align: 'start'},
{title: 'deuda2',key:'deuda2', align: 'start'},
{title: 'deuda3',key:'deuda3', align: 'start'},
{title: 'deuda4',key:'deuda4', align: 'start'},
{title: 'periodo1',key:'periodo1', align: 'start'},
{title: 'periodo2',key:'periodo2', align: 'start'},
{title: 'periodo3',key:'periodo3', align: 'start'},
{title: 'periodo4',key:'periodo4', align: 'start'},
{title: 'subtotal',key:'subtotal', align: 'start'},
{title: 'pago_forma',key:'pago_forma', align: 'start'},
{title: 'cobrador',key:'cobrador', align: 'start'},
{title: 'total_ctacte',key:'total_ctacte', align: 'start'},
{title: 'baja_fecha',key:'baja_fecha', align: 'start'},
{title: 'nro_ref_elect',key:'nro_ref_elect', align: 'start'},
{title: 'celular',key:'celular', align: 'start'},
{title: 'deno_provin',key:'deno_provin', align: 'start'}
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
    return PadronProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      contra: [(v: any) => !!v || 'validation.required'],
ape_nom: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'origen',type:'string',label:'origen',default:''},
{name:'ente',type:'number',label:'ente',default:null},
{name:'contra',type:'string',label:'contra',default:''},
{name:'ape_nom',type:'string',label:'ape_nom',default:''},
{name:'cant_inte',type:'number',label:'cant_inte',default:null},
{name:'plan_codi',type:'string',label:'plan_codi',default:''},
{name:'domicilio',type:'string',label:'domicilio',default:''},
{name:'loca',type:'string',label:'loca',default:''},
{name:'tele',type:'string',label:'tele',default:''},
{name:'deuda1',type:'number',label:'deuda1',default:0},
{name:'deuda2',type:'number',label:'deuda2',default:0},
{name:'deuda3',type:'number',label:'deuda3',default:0},
{name:'deuda4',type:'number',label:'deuda4',default:0},
{name:'periodo1',type:'date',label:'periodo1',default:null},
{name:'periodo2',type:'date',label:'periodo2',default:null},
{name:'periodo3',type:'date',label:'periodo3',default:null},
{name:'periodo4',type:'date',label:'periodo4',default:null},
{name:'subtotal',type:'number',label:'subtotal',default:0},
{name:'pago_forma',type:'string',label:'pago_forma',default:''},
{name:'cobrador',type:'string',label:'cobrador',default:''},
{name:'total_ctacte',type:'number',label:'total_ctacte',default:0},
{name:'baja_fecha',type:'date',label:'baja_fecha',default:null},
{name:'nro_ref_elect',type:'string',label:'nro_ref_elect',default:''},
{name:'celular',type:'string',label:'celular',default:''},
{name:'deno_provin',type:'string',label:'deno_provin',default:''}
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

export default PadronCrud
