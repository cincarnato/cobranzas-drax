
import InternalTransferBonusCrudPage from "../pages/crud/InternalTransferBonusCrudPage.vue";


const InternalTransferBonusCrudRoute = [
  {
    name: 'InternalTransferBonusCrudPage',
    path: '/crud/internaltransferbonus',
    component: InternalTransferBonusCrudPage,
    meta: {
      auth: true,
      permission: 'internaltransferbonus:manage',
    }
  },
]

export default InternalTransferBonusCrudRoute
export { InternalTransferBonusCrudRoute }
