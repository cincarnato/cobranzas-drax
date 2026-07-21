
import TypificationEmailCrudPage from "../pages/crud/TypificationEmailCrudPage.vue";


const TypificationEmailCrudRoute = [
  {
    name: 'TypificationEmailCrudPage',
    path: '/crud/typificationemail',
    component: TypificationEmailCrudPage,
    meta: {
      auth: true,
      permission: 'typificationemail:manage',
    }
  },
]

export default TypificationEmailCrudRoute
export { TypificationEmailCrudRoute }
