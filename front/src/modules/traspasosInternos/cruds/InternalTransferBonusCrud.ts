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
import {UserCrud} from "@drax/identity-vue"
import InternalTransferBonusProvider from "../providers/InternalTransferBonusProvider";

class InternalTransferBonusCrud extends EntityCrud implements IEntityCrud {

  static singleton: InternalTransferBonusCrud
  private store

  constructor() {
    super();
    this.name = 'InternalTransferBonus'
    this.store = useCrudStore(this.name)
  }

  static get instance(): InternalTransferBonusCrud {
    if (!InternalTransferBonusCrud.singleton) {
      InternalTransferBonusCrud.singleton = new InternalTransferBonusCrud()
    }
    return InternalTransferBonusCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
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
      {title: 'createdAt', key: 'createdAt', align: 'start'},
      {title: 'createdBy', key: 'createdBy', align: 'start'},
      {title: 'status', key: 'status', align: 'start'},
      {title: 'dni', key: 'dni', align: 'start'},
      {title: 'fullname', key: 'fullname', align: 'start'},
      {title: 'appliedMonth', key: 'appliedMonth', align: 'start'},
      {title: 'bonifiedValue', key: 'bonifiedValue', align: 'start'},
      {title: 'bonusType', key: 'bonusType', align: 'start'},
      {title: 'bankDataAttachment', key: 'bankDataAttachment', align: 'start'},
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
    return InternalTransferBonusProvider.instance
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
      appliedMonth: [(v: any) => !!v || 'validation.required'],
      bonifiedValue: [(v: any) => !!v || 'validation.required'],
      bonusType: [(v: any) => !!v || 'validation.required'],
      bankDataAttachment: [
        (v: any) => {
          if (this.store.getFieldValue('bonusType') !== 'Transferencia Bancaria') {
            return true
          }

          if (typeof v === 'string') {
            return !!v.trim() || 'validation.required'
          }

          return !!v?.url || !!v?.filepath || 'validation.required'
        }
      ],
      status: [(v: any) => !!v || 'validation.required'],
      observation: [
        (v: any) => this.store.getFieldValue('status') !== 'No aplicado' || !!v || 'validation.required'
      ],
      createdBy: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[] {
    const fields: IEntityCrudField[] = [
      {name: 'dni', type: 'string', label: 'dni', default: '', md: 6},
      {name: 'fullname', type: 'string', label: 'fullname', default: '', md: 6},
      {
        name: 'appliedMonth', type: 'select', label: 'appliedMonth', default: null, md: 4, items: [
          {title: "Enero", value: "Enero"},
          {title: "Febrero", value: "Febrero"},
          {title: "Marzo", value: "Marzo"},
          {title: "Abril", value: "Abril"},
          {title: "Mayo", value: "Mayo"},
          {title: "Junio", value: "Junio"},
          {title: "Julio", value: "Julio"},
          {title: "Agosto", value: "Agosto"},
          {title: "Septiembre", value: "Septiembre"},
          {title: "Octubre", value: "Octubre"},
          {title: "Noviembre", value: "Noviembre"},
          {title: "Diciembre", value: "Diciembre"}
        ]
      },
      {name: 'bonifiedValue', type: 'number', label: 'bonifiedValue', default: null, md: 4},
      {
        name: 'bonusType',
        type: 'enum',
        label: 'bonusType',
        default: null,
        md: 4,
        enum: ['Crédito en Cuenta Corriente', 'Transferencia Bancaria']
      },
      {
        name: 'bankDataAttachment',
        type: 'fullFile',
        label: 'bankDataAttachment',
        default: {},
        md: 12,
        hint: 'Adjuntar CBU, Alias u otra documentacion respaldatoria',
        persistentHint: true
      },
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

    if (this.store.getFieldValue('bonusType') !== 'Transferencia Bancaria') {
      return fields.filter(field => field.name !== 'bankDataAttachment')
    }

    return fields
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

      {
        name: 'bonusType',
        type: 'enum',
        label: 'bonusType',
        default: null,
        enum: ['Crédito en Cuenta Corriente', 'Transferencia Bancaria'],
        operator: 'in'
      },
      {
        name: 'appliedMonth',
        type: 'select',
        label: 'appliedMonth',
        default: null,
        items: [
          {title: "Enero", value: "Enero"},
          {title: "Febrero", value: "Febrero"},
          {title: "Marzo", value: "Marzo"},
          {title: "Abril", value: "Abril"},
          {title: "Mayo", value: "Mayo"},
          {title: "Junio", value: "Junio"},
          {title: "Julio", value: "Julio"},
          {title: "Agosto", value: "Agosto"},
          {title: "Septiembre", value: "Septiembre"},
          {title: "Octubre", value: "Octubre"},
          {title: "Noviembre", value: "Noviembre"},
          {title: "Diciembre", value: "Diciembre"}
        ],
        operator: 'eq'
      },
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
    if (this.hasPermission('internaltransferbonus:manage')) {
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
    return this.hasPermission('internaltransferbonus:export')
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

  get containerFluid() {
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

export default InternalTransferBonusCrud
