
import TemplateEmailCrudPage from "../pages/crud/TemplateEmailCrudPage.vue";


const TemplateEmailCrudRoute = [
  {
    name: 'TemplateEmailCrudPage',
    path: '/crud/templateemail',
    component: TemplateEmailCrudPage,
    meta: {
      auth: true,
      permission: 'templateemail:manage',
    }
  },
]

export default TemplateEmailCrudRoute
export { TemplateEmailCrudRoute }
