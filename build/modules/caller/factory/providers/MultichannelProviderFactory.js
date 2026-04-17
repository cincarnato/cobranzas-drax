import MultichannelProvider from '../../providers/MultichannelProvider.js';
class MultichannelProviderFactory {
    static get instance() {
        if (!MultichannelProviderFactory.provider) {
            const apiKey = process.env.MULTICHANNEL_API_KEY;
            const messengerNumber = process.env.MULTICHANNEL_MESSENGER_NUMBER;
            if (!apiKey) {
                throw new Error('process.env.MULTICHANNEL_API_KEY not found');
            }
            if (!messengerNumber) {
                throw new Error('process.env.MULTICHANNEL_MESSENGER_NUMBER not found');
            }
            const endpointUrl = process.env.MULTICHANNEL_ENDPOINT_URL;
            MultichannelProviderFactory.provider = new MultichannelProvider(apiKey, messengerNumber, endpointUrl);
        }
        return MultichannelProviderFactory.provider;
    }
}
export default MultichannelProviderFactory;
export { MultichannelProviderFactory };
