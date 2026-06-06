import SetupDrax from './setup/SetupDrax.js';
import InboundEmailMailboxProvider from "./modules/mail/providers/InboundEmailMailboxProvider.js";
import InboundMailTransferProcessor from "./modules/transferencias/processors/InboundMailTransferProcessor.js";
await SetupDrax();
const inboundEmailMailboxProvider = InboundEmailMailboxProvider.instance;
const inboundMailTransferProcessor = InboundMailTransferProcessor.instance;
inboundEmailMailboxProvider.start();
inboundMailTransferProcessor.start();
