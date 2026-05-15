
import BonusCrudPage from "../pages/crud/BonusCrudPage.vue";


const BonusCrudRoute = [
  {
    name: 'BonusCrudPage',
    path: '/crud/bonus',
    component: BonusCrudPage,
    meta: {
      auth: true,
      permission: 'bonus:manage',
    }
  },
]

export default BonusCrudRoute
export { BonusCrudRoute }
