
import PadronCrudPage from "../pages/crud/PadronCrudPage.vue";
import PadronImportPage from "../pages/PadronImportPage.vue";


const PadronCrudRoute = [
  {
    name: 'PadronCrudPage',
    path: '/crud/padron',
    component: PadronCrudPage,
    meta: {
      auth: true,
      permission: 'padron:manage',
    }
  },
  {
    name: 'PadronImportPage',
    path: '/padron/import',
    component: PadronImportPage,
    meta: {
      auth: true,
      permission: 'padron:manage',
    }
  },
]

export default PadronCrudRoute
export { PadronCrudRoute }
