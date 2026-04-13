
import PadronCrudPage from "../pages/crud/PadronCrudPage.vue";


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
]

export default PadronCrudRoute
export { PadronCrudRoute }
