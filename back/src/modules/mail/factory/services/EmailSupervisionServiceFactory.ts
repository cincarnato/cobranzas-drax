import {EmailSupervisionService} from "../../services/EmailSupervisionService.js";

class EmailSupervisionServiceFactory {
    private static service: EmailSupervisionService;

    public static get instance(): EmailSupervisionService {
        if (!EmailSupervisionServiceFactory.service) {
            EmailSupervisionServiceFactory.service = new EmailSupervisionService();
        }
        return EmailSupervisionServiceFactory.service;
    }
}

export default EmailSupervisionServiceFactory;
export {EmailSupervisionServiceFactory};
