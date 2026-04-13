import afilmedRoutes from '../modules/afilmed/routes/index.js'
import baseRoutes from '../modules/base/routes/index.js'
import callerRoutes from '../modules/caller/routes/index.js'
import collectionsRoutes from '../modules/collections/routes/index.js'
import googleRoutes from '../modules/google/routes/index.js'
import mailRoutes from '../modules/mail/routes/index.js'
import premedicRoutes from '../modules/premedic/routes/index.js'
import transferenciasRoutes from '../modules/transferencias/routes/index.js'

const modulesRoutes = [
  ...afilmedRoutes,
  ...baseRoutes,
  ...callerRoutes,
  ...collectionsRoutes,
  ...googleRoutes,
  ...mailRoutes,
  ...premedicRoutes,
  ...transferenciasRoutes

]

export default modulesRoutes
export {modulesRoutes}
