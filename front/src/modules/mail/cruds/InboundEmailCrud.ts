import {EntityCrud} from "@drax/crud-vue";
import type {
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudPermissions,
  IEntityCrudRules
} from "@drax/crud-share";
import InboundEmailProvider from "../providers/InboundEmailProvider";


class InboundEmailCrud extends EntityCrud implements IEntityCrud {

  static singleton: InboundEmailCrud

  constructor() {
    super();
    this.name = 'InboundEmail'
  }

  static get instance(): InboundEmailCrud {
    if (!InboundEmailCrud.singleton) {
      InboundEmailCrud.singleton = new InboundEmailCrud()
    }
    return InboundEmailCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'inboundemail:manage',
      view: 'inboundemail:view',
      create: 'inboundemail:create',
      update: 'inboundemail:update',
      delete: 'inboundemail:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'receivedAt', key: 'receivedAt', align: 'start'},
      {title: 'subject', key: 'subject', align: 'start'},
      {title: 'fromName', key: 'fromName', align: 'start'},
      {title: 'fromEmail', key: 'fromEmail', align: 'start'},
      {title: 'hasAttachments', key: 'hasAttachments', align: 'start'},
      {title: 'attachmentCount', key: 'attachmentCount', align: 'start'},
      {title: 'category', key: 'category', align: 'start'},
      {title: 'sentiment', key: 'sentiment', align: 'start'},
      {title: 'priority', key: 'priority', align: 'start'},
      {title: 'name', key: 'customer.name', align: 'start'},
      {title: 'documentNumber', key: 'customer.documentNumber', align: 'start'},
      {title: 'cuil', key: 'customer.cuil', align: 'start'},
      {title: 'email', key: 'customer.email', align: 'start'},
      {title: 'phone', key: 'customer.phone', align: 'start'},
      {title: 'processingStatus', key: 'processingStatus', align: 'start'},
      {title: 'reviewStatus', key: 'reviewStatus', align: 'start'},
      {title: 'isDuplicate', key: 'isDuplicate', align: 'start'},
      {title: 'messageId', key: 'messageId', align: 'start'},
      {title: 'threadId', key: 'threadId', align: 'start'},
      {title: 'mailbox', key: 'mailbox', align: 'start'},
      {title: 'sourceChannel', key: 'sourceChannel', align: 'start'},
    ]
  }

  get selectedHeaders(): string[] {
    return [
      'receivedAt', 'subject', 'fromEmail', 'hasAttachments',
      'category', 'sentiment', 'priority',
      'customer.name', 'customer.cuil', 'customer.documentNumber'
    ]
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
    return InboundEmailProvider.instance
  }

  get rules(): IEntityCrudRules {
    return {
      messageId: [(v: any) => !!v || 'validation.required'],
      sourceChannel: [(v: any) => !!v || 'validation.required'],
      receivedAt: [(v: any) => !!v || 'validation.required'],
      customer: [],
      extractedEntities: [],
      processingStatus: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'messageId', type: 'string', label: 'messageId', default: '', groupTab: 'General'},
      {name: 'threadId', type: 'string', label: 'threadId', default: '', groupTab: 'General'},
      {name: 'mailbox', type: 'string', label: 'mailbox', default: '', groupTab: 'General'},
      {
        name: 'sourceChannel',
        type: 'enum',
        label: 'sourceChannel',
        default: 'EMAIL',
        groupTab: 'General',
        enum: ['EMAIL', 'FORWARDED_EMAIL', 'MANUAL_UPLOAD', 'API']
      },
      {name: 'receivedAt', type: 'date', label: 'receivedAt', default: null, groupTab: 'General'},
      {name: 'subject', type: 'string', label: 'subject', default: '', groupTab: 'General'},
      {name: 'fromName', type: 'string', label: 'fromName', default: '', groupTab: 'General'},
      {name: 'fromEmail', type: 'string', label: 'fromEmail', default: '', groupTab: 'General'},
      {name: 'toEmails', type: 'array.string', label: 'toEmails', default: [], groupTab: 'General'},
      {name: 'ccEmails', type: 'array.string', label: 'ccEmails', default: [], groupTab: 'General'},
      {name: 'replyToEmail', type: 'string', label: 'replyToEmail', default: '', groupTab: 'General'},
      {name: 'bodyText', type: 'longString', label: 'bodyText', default: '', groupTab: 'Contenido'},
      {name: 'bodyHtml', type: 'longString', label: 'bodyHtml', default: '', groupTab: 'Contenido'},
      {name: 'normalizedText', type: 'longString', label: 'normalizedText', default: '', groupTab: 'Contenido'},
      {name: 'hasAttachments', type: 'boolean', label: 'hasAttachments', default: false, groupTab: 'Contenido'},
      {name: 'attachmentCount', type: 'number', label: 'attachmentCount', default: 0, groupTab: 'Contenido'},
      {name: 'attachments', type: 'array.fullFile', label: 'attachments', default: null, groupTab: 'Adjuntos'},
      {name: 'attachmentsOcrText', type: 'longString', label: 'attachmentsOcrText', default: null, groupTab: 'Adjuntos'},
      {name: 'category', type: 'string', label: 'category', default: '', groupTab: 'Analisis IA'},
      {
        name: 'sentiment',
        type: 'string',
        label: 'sentiment',
        default: null,
        groupTab: 'Analisis IA'
      },
      {
        name: 'priority',
        type: 'string',
        label: 'priority',
        default: null,
        groupTab: 'Analisis IA'
      },
      {name: 'summary', type: 'longString', label: 'summary', default: '', groupTab: 'Analisis IA'},
      {name: 'tags', type: 'array.string', label: 'tags', default: [], groupTab: 'Analisis IA'},
      {name: 'aiModel', type: 'string', label: 'aiModel', default: '', groupTab: 'Analisis IA'},
      {
        name: 'customer',
        type: 'object',
        label: 'customer',
        default: {
          "name": "''",
          "documentNumber": "''",
          "cuil": "''",
          "email": "''",
          "phone": "''"
        },
        groupTab: 'Extraccion',
        objectFields: [{name: 'name', type: 'string', label: 'name', default: ''},
          {name: 'documentNumber', type: 'string', label: 'documentNumber', default: ''},
          {name: 'cuil', type: 'string', label: 'cuil', default: ''},
          {name: 'email', type: 'string', label: 'email', default: ''},
          {name: 'phone', type: 'string', label: 'phone', default: ''}]
      },
      {
        name: 'extractedEntities',
        type: 'array.object',
        label: 'extractedEntities',
        default: [],
        groupTab: 'Extraccion',
        objectFields: [{name: 'label', type: 'string', label: 'label', default: ''},
          {name: 'value', type: 'string', label: 'value', default: ''},
          {
            name: 'source',
            type: 'enum',
            label: 'source',
            default: null,
            enum: ['SUBJECT', 'BODY', 'ATTACHMENT', 'MANUAL']
          },
          {name: 'confidence', type: 'number', label: 'confidence', default: null}]
      },
      {
        name: 'processingStatus',
        type: 'enum',
        label: 'processingStatus',
        default: 'PENDING',
        groupTab: 'Procesamiento',
        enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'REVIEW_REQUIRED', 'REJECTED', 'ERROR']
      },
      {
        name: 'reviewStatus',
        type: 'enum',
        label: 'reviewStatus',
        default: 'PENDING',
        groupTab: 'Procesamiento',
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'CORRECTED']
      },
      {name: 'isDuplicate', type: 'boolean', label: 'isDuplicate', default: false, groupTab: 'Procesamiento'},
      {
        name: 'duplicateOfMessageId',
        type: 'string',
        label: 'duplicateOfMessageId',
        default: '',
        groupTab: 'Procesamiento'
      },
      {name: 'processedAt', type: 'date', label: 'processedAt', default: null, groupTab: 'Procesamiento'}
    ]
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
    return false
  }

  get isCreatable() {
    return false
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
    return true
  }

  get tabs() {
    return [
      'General', 'Contenido', 'Adjuntos', 'Analisis IA', 'Extraccion', 'Procesamiento'
    ]
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

export default InboundEmailCrud
