import {EntityCrud, useCrudStore} from "@drax/crud-vue";
import type {
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
    if (!BonusCrud.singleton) {
      BonusCrud.singleton = new BonusCrud()
    }
    return BonusCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
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
      {title: 'createdAt', key: 'createdAt', align: 'start'},
      {title: 'createdBy', key: 'createdBy', align: 'start'},
      {title: 'status', key: 'status', align: 'start'},
      {title: 'dni', key: 'dni', align: 'start'},
      {title: 'fullname', key: 'fullname', align: 'start'},
      {title: 'plan', key: 'plan', align: 'start'},
      {title: 'appliedMonth', key: 'appliedMonth', align: 'start'},
      {title: 'paymentMethod', key: 'paymentMethod', align: 'start'},
      {title: 'bonus', key: 'bonus', align: 'start'},
      {title: 'period', key: 'period', align: 'start'},
      {title: 'bonifiedNetValue', key: 'bonifiedNetValue', align: 'start'},
      {title: 'observation', key: 'observation', align: 'start'}
    ]
  }

  get selectedHeaders(): string[] {
    return this.headers.map(header => header.key)
  }

  get actionHeaders(): IEntityCrudHeader[] {
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

  get provider(): IDraxCrudProvider<any, any, any> {
    return BonusProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      dni: [(v: any) => !!v || 'validation.required'],
      fullname: [(v: any) => !!v || 'validation.required'],
      plan: [(v: any) => !!v || 'validation.required'],
      appliedMonth: [(v: any) => !!v || 'validation.required'],
      paymentMethod: [(v: any) => !!v || 'validation.required'],
      bonus: [(v: any) => !!v || 'validation.required'],
      period: [(v: any) => !!v || 'validation.required'],
      bonifiedNetValue: [(v: any) => !!v || 'validation.required'],
      status: [(v: any) => !!v || 'validation.required'],
      observation: [
        (v: any) => this.store.getFieldValue('status') !== 'No aplicado' || !!v || 'validation.required'
      ]
    }
  }

  get fields(): IEntityCrudField[] {
    return [

      {name: 'dni', type: 'string', label: 'dni', default: '', md: 6},
      {name: 'fullname', type: 'string', label: 'fullname', default: '', md: 6},
      {name: 'plan', type: 'select', label: 'plan', default: null, md: 4, items: [
          { title: "100", value: "100" },
          { title: "200", value: "200" },
          { title: "300", value: "300" },
          { title: "400", value: "400" },
          { title: "500", value: "500" },
          { title: "Plan Simple", value: "Plan Simple" },
          { title: "Plan Bronce", value: "Plan Bronce" },
          { title: "Plan Plata", value: "Plan Plata" }
        ]
      },
      {name: 'appliedMonth', type: 'select', label: 'appliedMonth', default: null, md: 4, items: [
          { title: "Enero", value: "Enero" },
          { title: "Febrero", value: "Febrero" },
          { title: "Marzo", value: "Marzo" },
          { title: "Abril", value: "Abril" },
          { title: "Mayo", value: "Mayo" },
          { title: "Junio", value: "Junio" },
          { title: "Julio", value: "Julio" },
          { title: "Agosto", value: "Agosto" },
          { title: "Septiembre", value: "Septiembre" },
          { title: "Octubre", value: "Octubre" },
          { title: "Noviembre", value: "Noviembre" },
          { title: "Diciembre", value: "Diciembre" }
        ]
      },
      {name: 'paymentMethod', type: 'select', label: 'paymentMethod', default: null, md: 4, items: [
          { title: "Cobrador", value: "Cobrador" },
          { title: "Débito Automático", value: "Débito Automático" }
        ]
      },
      {name: 'bonus', type: 'string', label: 'bonus', default: '', md: 4},
      {
        name: 'period',
        type: 'enum',
        label: 'period',
        default: null,
        md: 4,
        enum: ['1 Mes', '2 Meses', '3 Meses', '4 Meses', '5 Meses', '6 Meses']
      },
      {name: 'bonifiedNetValue', type: 'number', label: 'bonifiedNetValue', default: null, md: 4},
      {
        name: 'status',
        type: 'enum',
        label: 'status',
        default: 'Pendiente',
        enum: ['Pendiente', 'Aplicado', 'No aplicado']
      },
      {name: 'observation', type: 'longString', label: 'observation', default: ''},
      {name: 'createdBy', type: 'ref', label: 'createdBy', default: null, ref: 'User', refDisplay: 'name'}
    ]
  }

  get createFields() {
    return this.fields.filter(field => !['createdBy', 'status', 'observation'].includes(field.name))
  }

  get updateFields() {
    return this.fields.filter(field => field.name !== 'createdBy')
  }

  get filters(): IEntityCrudFilter[] {
    return [
      {name: 'dni', type: 'string', label: 'dni', default: '', operator: 'eq'},
      {name: 'fullname', type: 'string', label: 'fullname', default: '', operator: 'like'},
      {name: 'plan', type: 'string', label: 'plan', default: '', operator: 'like'},
      {
        name: 'status',
        type: 'enum',
        label: 'status',
        default: null,
        enum: ['Pendiente', 'Aplicado', 'No aplicado'],
        operator: 'in'
      },
      {
        name: 'createdBy',
        type: 'ref',
        label: 'createdBy',
        default: null,
        ref: 'User',
        refDisplay: 'name',
        operator: 'in'
      },
    ]
  }

  get isViewable() {
    return true
  }

  get isEditable() {
    return true
  }

  isItemEditable(item?: any): boolean {
    if (this.hasPermission('bonus:manage')) {
      return true
    }

    const authUserId = this.getAuthUserId()
    const createdBy = typeof item?.createdBy === 'string'
      ? item.createdBy
      : item?.createdBy?._id ?? item?.createdBy?.id

    return !!authUserId && authUserId === createdBy && this.isToday(item?.createdAt)
  }

  get isCreatable() {
    return true
  }

  get isDeletable() {
    return false
  }

  get isExportable() {
    return this.hasPermission('bonus:export')
  }

  get exportFormats() {
    return ['CSV', 'JSON']
  }

  get exportHeaders() {
    return this.headers.map(header => header.key)
  }

  get isImportable() {
    return false
  }

  get isColumnSelectable() {
    return true
  }

  get isGroupable() {
    return true
  }

  get importFormats() {
    return ['CSV', 'JSON']
  }

  get dialogFullscreen() {
    return false
  }

  get tabs() {
    return []
  }

  get menus() {
    return []
  }

  get searchEnable() {
    return true
  }

  get filtersEnable() {
    return true
  }

  get dynamicFiltersEnable() {
    return true
  }

  get containerFluid(){
    return true
  }

  private getAuthUserId() {
    const authStoreString = localStorage.getItem('AuthStore')

    if (!authStoreString) {
      return ''
    }

    const authStoreObject = JSON.parse(authStoreString)
    return authStoreObject?.authUser?._id ?? authStoreObject?.authUser?.id ?? ''
  }

  private hasPermission(permission: string) {
    const authStoreString = localStorage.getItem('AuthStore')

    if (!authStoreString) {
      return false
    }

    const authStoreObject = JSON.parse(authStoreString)
    return authStoreObject?.authUser?.role?.permissions?.includes(permission) ?? false
  }

  private isToday(value?: Date | string) {
    if (!value) {
      return false
    }

    const date = new Date(value)
    const today = new Date()

    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate()
  }




}

export default BonusCrud
