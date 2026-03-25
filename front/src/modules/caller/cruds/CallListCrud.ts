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
import CallListProvider from "../providers/CallListProvider";

//Import EntityCrud Refs
import GroupCrud from "../../collections/cruds/GroupZoneCrud";
import {UserCrud} from "@drax/identity-vue"

class CallListCrud extends EntityCrud implements IEntityCrud {

  static singleton: CallListCrud
  private store

  constructor() {
    super();
    this.name = 'CallList'
    this.store = useCrudStore(this.name)
    console.log(this.store.id)
  }

  static get instance(): CallListCrud {
    if (!CallListCrud.singleton) {
      CallListCrud.singleton = new CallListCrud()
    }
    return CallListCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'calllist:manage',
      view: 'calllist:view',
      create: 'calllist:create',
      update: 'calllist:update',
      delete: 'calllist:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'deadline', key: 'deadline', align: 'start'},
      {title: 'group', key: 'group', align: 'start'},
      {title: 'user', key: 'user', align: 'start'},
      {title: 'file', key: 'file', align: 'start'},
      {title: 'state', key: 'state', align: 'start'},
      {title: 'total', key: 'total', align: 'start'},
      {title: 'attempts', key: 'attempts', align: 'start'},
      {title: 'success', key: 'success', align: 'start'},
      {title: 'promises', key: 'promises', align: 'start'},
      {title: 'failed', key: 'failed', align: 'start'}
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
    return CallListProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      Group: GroupCrud.instance,
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      attemptsControl: [],
      name: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[] {
    return [

      {name: 'name', type: 'string', label: 'name', default: ''},
      {name: 'deadline', type: 'date', label: 'deadline', default: null},
      {name: 'file', type: 'fullFile', label: 'file', default: {}},

      {name: 'group', type: 'ref', label: 'group', default: null, ref: 'Group', refDisplay: 'name'},
      {name: 'user', type: 'ref', label: 'user', default: null, ref: 'User', refDisplay: 'name'},

      {
        name: 'state',
        type: 'enum',
        label: 'state',
        default: 'PREPARANDO',
        enum: ['PREPARANDO', 'EN_CURSO', 'ARCHIVADO', 'FINALIZADO', 'VENCIDO']
      },
      {name: 'total', type: 'number', label: 'total', default: 0},
      {name: 'attempts', type: 'number', label: 'attempts', default: 0},
      {
        name: 'attemptsControl',
        type: 'array.object',
        label: 'attemptsControl',
        default: [],
        objectFields: [{name: 'number', type: 'number', label: 'number', default: 0},
          {name: 'count', type: 'number', label: 'count', default: 0},
          {name: 'success', type: 'number', label: 'success', default: 0},
          {name: 'promises', type: 'number', label: 'promises', default: 0}]
      },
      {name: 'success', type: 'number', label: 'success', default: 0},
      {name: 'promises', type: 'number', label: 'promises', default: 0},
      {name: 'failed', type: 'number', label: 'failed', default: 0},


      {name: 'headers', type: 'array.string', label: 'headers', default: []}
    ]
  }

  get formFields(){
    return ['name','deadline','file','group','user']
  }

  get createFields() {
    return this.fields
      .filter(field => this.formFields.includes(field.name))
  }

  get updateFields() {
    return this.fields
      .filter(field => this.formFields.includes(field.name))
  }

  get filters(): IEntityCrudFilter[] {
    return [
      //{name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
    ]
  }

  get isViewable() {
    return true
  }

  get isEditable() {
    return true
  }

  get isCreatable() {
    return true
  }

  get isDeletable() {
    return true
  }

  get isExportable() {
    return true
  }

  get exportFormats() {
    return ['CSV', 'JSON']
  }

  get exportHeaders() {
    return ['_id']
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


}

export default CallListCrud

