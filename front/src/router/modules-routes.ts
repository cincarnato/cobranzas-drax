import baseRoutes from '../modules/base/routes/index.js'
import collectionsRoutes from '../modules/collections/routes/index.js'
import googleRoutes from '../modules/google/routes/index.js'

const modulesRoutes = [
  ...baseRoutes,
  ...collectionsRoutes,
  ...googleRoutes

]

export default modulesRoutes
export {modulesRoutes}
