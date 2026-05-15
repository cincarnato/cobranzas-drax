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
      {name: 'plan', type: 'string', label: 'plan', default: '', md: 4},
      {name: 'appliedMonth', type: 'string', label: 'appliedMonth', default: '', md: 4},
      {name: 'paymentMethod', type: 'string', label: 'paymentMethod', default: '', md: 4},
      {name: 'bonus', type: 'string', label: 'bonus', default: '', md: 6},
      {name: 'bonifiedNetValue', type: 'number', label: 'bonifiedNetValue', default: null, md: 6},
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
