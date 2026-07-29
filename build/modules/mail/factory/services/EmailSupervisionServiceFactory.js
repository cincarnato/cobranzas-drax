import { EmailSupervisionService } from "../../services/EmailSupervisionService.js";
class EmailSupervisionServiceFactory {
    static get instance() {
        if (!EmailSupervisionServiceFactory.service) {
            EmailSupervisionServiceFactory.service = new EmailSupervisionService();
        }
        return EmailSupervisionServiceFactory.service;
    }
}
export default EmailSupervisionServiceFactory;
export { EmailSupervisionServiceFactory };
