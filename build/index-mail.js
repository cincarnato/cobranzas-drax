import SetupDrax from './setup/SetupDrax.js';
import InboundEmailMailboxProvider from "./modules/mail/providers/InboundEmailMailboxProvider.js";
await SetupDrax();
const inboundEmailMailboxProvider = InboundEmailMailboxProvider.instance;
inboundEmailMailboxProvider.start();
