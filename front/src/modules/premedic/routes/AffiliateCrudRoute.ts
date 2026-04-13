
import AffiliateCrudPage from "../pages/crud/AffiliateCrudPage.vue";


const AffiliateCrudRoute = [
  {
    name: 'AffiliateCrudPage',
    path: '/crud/affiliate',
    component: AffiliateCrudPage,
    meta: {
      auth: true,
      permission: 'affiliate:manage',
    }
  },
]

export default AffiliateCrudRoute
export { AffiliateCrudRoute }
