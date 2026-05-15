import BonusExportPage from "../pages/BonusExportPage.vue";

const BonusExportRoute = [
  {
    name: 'BonusExportPage',
    path: '/export/bonus',
    component: BonusExportPage,
    meta: {
      auth: true,
      permission: 'bonus:export',
    }
  },
]

export default BonusExportRoute
export { BonusExportRoute }
