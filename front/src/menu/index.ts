import type { MenuItem } from '../types/menu'

const menu: MenuItem[] = [
  {
    icon: 'mdi-home',
    text: 'home',
    link: { name: "Home" },
    gallery: false,
    auth: false
  },

  {
    icon: 'mdi-account-circle',
    text: 'Cobranzas',
    description: 'Gestión y administración de cuentas de cobro, convenios y reportes contables',
    gallery: true,
    children: [
      {
        icon: 'mdi-view-dashboard-variant-outline',
        text: 'Dashboard',
        link: { name: "CovenantDashboardPage" },
        gallery: true,
        permission: 'covenant:manage'
      },
      {
        icon: 'mdi-currency-usd',
        text: 'covenant.menu',
        link: { name: "CovenantCrudPage" },
        gallery: true,
        permission: 'covenant:manage'
      },
      {
        icon: 'mdi-file-excel-outline',
        text: 'covenant.exportMenu',
        link: { name: "CovenantExportPage" },
        gallery: true,
        permission: 'covenant:manage'
      },


    ],
  },
  {
    icon: 'mdi-account-circle',
    text: 'LLamados',
    description: 'Supervisión y control de campañas telefónicas y registro de gestiones',
    gallery: true,
    children: [

      {
        icon: 'mdi-format-list-bulleted',
        text: 'Administrar Listados',
        link: { name: "CallListCrudPage" },
        gallery: true,
        permission: 'calllist:manage'
      },
      {
        icon: 'mdi-phone-log',
        text: 'Gestion de Llamadas',
        link: { name: "CallListDashboardPage" },
        gallery: true,
        permission: 'calllist:view'
      },
      {
        icon: 'mdi-phone-check',
        text: 'callsuccesstype.menu',
        link: { name: "CallSuccessTypeCrudPage" },
        gallery: true,
        permission: 'callsuccesstype:manage'
      },
      {
        icon: 'mdi-phone-remove',
        text: 'callfailedtype.menu',
        link: { name: "CallFailedTypeCrudPage" },
        gallery: true,
        permission: 'callfailedtype:manage'
      },
    ],
  },

  {
    icon: 'mdi-bank-transfer',
    text: 'Transferencias',
    description: 'Conciliación, revisión de comprobantes y validación de cobros transferidos',
    gallery: true,
    children: [
      {
        icon: 'mdi-swap-horizontal',
        text: 'bankmovement.menu',
        link: { name: "BankMovementCrudPage" },
        gallery: true,
        permission: 'bankmovement:manage'
      },
      {
        icon: 'mdi-account-search',
        text: 'payerentity.menu',
        link: { name: "PayerEntityCrudPage" },
        gallery: true,
        permission: 'payerentity:manage'
      },
      {
        icon: 'mdi-email-fast-outline',
        text: 'transferemail.menu',
        link: { name: "TransferEmailCrudPage" },
        gallery: true,
        permission: 'transferemail:manage'
      },
      {
        icon: 'mdi-play-circle-outline',
        text: 'Procesar correos de transferencias',
        link: { name: "TransferEmailProcessPage" },
        gallery: true,
        permission: 'transferemail:manage'
      },
    ],
  },

  {
    icon: 'mdi-email-outline',
    text: 'Mail',
    description: 'Buzón de correos entrantes y procesamiento de comprobantes adjuntos',
    gallery: true,
    children: [
      {
        icon: 'mdi-email-cog-outline',
        text: 'mailbox.menu',
        link: { name: "MailboxCrudPage" },
        gallery: true,
        permission: 'mailbox:manage'
      },
      {
        icon: 'mdi-email-receive-outline',
        text: 'inboundemail.menu',
        link: { name: "InboundEmailCrudPage" },
        gallery: true,
        permission: 'inboundemail:manage'
      },
      {
        icon: 'mdi-sync',
        text: 'Sincronizar correos',
        link: { name: "InboundEmailSyncPage" },
        gallery: true,
        permission: 'mailbox:manage'
      },
    ],
  },
  {
    icon: 'mdi-card-account-details-outline',
    text: 'Premedic',
    description: 'Información y configuración de afiliados y planes médicos Premedic',
    gallery: true,
    children: [
      {
        icon: 'mdi-account-multiple',
        text: 'affiliate.menu',
        link: { name: "AffiliateCrudPage" },
        gallery: true,
        permission: 'affiliate:manage'
      },
      {
        icon: 'mdi-shape-outline',
        text: 'affiliatetype.menu',
        link: { name: "AffiliateTypeCrudPage" },
        gallery: true,
        permission: 'affiliatetype:manage'
      },
    ],
  },
  {
    icon: 'mdi-account-circle',
    text: 'Afilmed',
    description: 'Consulta de padrón y datos registrales de la red Afilmed',
    gallery: true,
    children: [

      {
        icon: 'mdi-format-list-bulleted',
        text: 'Padron',
        link: { name: "PadronCrudPage" },
        gallery: true,
        permission: 'padron:manage'
      },

    ],
  },
  {
    icon: 'mdi-account-circle',
    text: 'Administración',
    description: 'Ajustes del sistema, usuarios, roles y seguridad de la plataforma',
    gallery: true,
    permission: 'user:manage',
    children: [
      {
        icon: 'mdi-map-marker-radius',
        text: 'groupzone.menu',
        link: { name: "GroupZoneCrudPage" },
        gallery: true,
        permission: 'groupzone:manage'
      },
      // {
      //   icon: 'mdi-domain',
      //   text: 'tenant.menu',
      //   link: { name: "CrudTenant" },
      //   gallery: true,
      //   permission: 'tenant:manage'
      // },
      {
        icon: 'mdi-table-account',
        text: 'user.menu',
        link: { name: "CrudUser" },
        gallery: true,
        permission: 'user:manage'
      },

      {
        icon: 'mdi-chair-rolling',
        text: 'role.menu',
        link: { name: "CrudRole" },
        gallery: true,
        permission: 'role:manage'
      },


      {
        icon: 'mdi mdi-table-key',
        text: 'userapikey.menu',
        link: { name: "CrudUserApiKey" },
        gallery: true,
        permission: 'userApiKey:manage'
      },
      {
        icon: 'mdi-account-arrow-right',
        text: 'usersession.menu',
        link: { name: "UserSessionCrudPage" },
        gallery: true,
        permission: 'usersession:menu'
      },
      {
        icon: 'mdi-lock-alert-outline',
        text: 'userloginfail.menu',
        link: { name: "UserLoginFailCrudPage" },
        gallery: true,
        permission: 'userloginfail:manage'
      },
      {
        icon: 'mdi mdi-cog',
        text: 'setting.menu',
        link: { name: "SettingPage" },
        gallery: true,
        permission: 'setting:manage'
      },

      {
        icon: 'mdi-view-dashboard-edit',
        text: 'dashboard.menu',
        link: { name: "DashboardCrudPage" },
        gallery: true,
        permission: 'dashboard:manage'
      },
      {
        icon: 'mdi-police-badge',
        text: 'audit.menu',
        link: { name: "AuditCrudPage" },
        gallery: true,
        permission: 'audit:manage'
      },
      {
        icon: 'mdi-file',
        text:'file.menu',
        link: { name: "FileCrudPage" },
        gallery: true,
        permission: 'file:manage'
      },
      {
        icon: 'mdi-robot',
        text:'ailog.menu',
        link: { name: "AILogCrudPage" },
        gallery: true,
        permission: 'ailog:manage'
      },
    ]
  },

]

export default menu

export {
  menu
}
