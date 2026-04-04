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
    text: 'COBRANZAS',
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
        icon: 'mdi-domain',
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
      {
        icon: 'mdi-map-marker-radius',
        text: 'groupzone.menu',
        link: { name: "GroupZoneCrudPage" },
        gallery: true,
        permission: 'groupzone:manage'
      },

    ],
  },
  {
    icon: 'mdi-account-circle',
    text: 'LLamados',
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
        text: 'Dashboard Llamadas',
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
    icon: 'mdi-account-circle',
    text: 'admin',
    gallery: true,
    permission: 'user:manage',
    children: [
      {
        icon: 'mdi-domain',
        text: 'tenant.menu',
        link: { name: "CrudTenant" },
        gallery: true,
        permission: 'tenant:manage'
      },
      {
        icon: 'mdi-chair-rolling',
        text: 'role.menu',
        link: { name: "CrudRole" },
        gallery: true,
        permission: 'role:manage'
      },

      {
        icon: 'mdi-table-account',
        text: 'user.menu',
        link: { name: "CrudUser" },
        gallery: true,
        permission: 'user:manage'
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
    ]
  },

]

export default menu

export {
  menu
}
