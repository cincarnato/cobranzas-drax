
import AffiliateTypeCrudPage from "../pages/crud/AffiliateTypeCrudPage.vue";


const AffiliateTypeCrudRoute = [
  {
    name: 'AffiliateTypeCrudPage',
    path: '/crud/affiliatetype',
    component: AffiliateTypeCrudPage,
    meta: {
      auth: true,
      permission: 'affiliatetype:manage',
    }
  },
]

export default AffiliateTypeCrudRoute
export { AffiliateTypeCrudRoute }
