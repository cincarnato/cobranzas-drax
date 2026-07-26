import InternalTransferBonusExportPage from "../pages/InternalTransferBonusExportPage.vue";

const InternalTransferBonusExportRoute = [
  {
    name: 'InternalTransferBonusExportPage',
    path: '/export/internal-transfer-bonus',
    component: InternalTransferBonusExportPage,
    meta: {
      auth: true,
      permission: 'internaltransferbonus:export',
    }
  },
]

export default InternalTransferBonusExportRoute
export { InternalTransferBonusExportRoute }
