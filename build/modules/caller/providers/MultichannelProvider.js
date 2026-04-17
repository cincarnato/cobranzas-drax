class MultichannelProviderError extends Error {
    constructor(message, statusCode, payload) {
        super(message);
        this.name = 'MultichannelProviderError';
        this.statusCode = statusCode;
        this.payload = payload;
    }
}
class MultichannelProvider {
    constructor(apiKey, messengerNumber, endpointUrl = 'https://multicapi.sondeosglobal.com/webServiceMessage') {
        this.apiKey = apiKey;
        this.messengerNumber = messengerNumber;
        this.endpointUrl = endpointUrl;
    }
    async sendWhatsappTemplate(params) {
        const destinatario = this.normalizePhone(params.destinatario);
        if (!destinatario) {
            throw new MultichannelProviderError('El número de destinatario es inválido.', 400, {
                status: {
                    code: 2,
                    message: 'El número de destinatario es inválido.',
                },
            });
        }
        const body = JSON.stringify({
            ...params,
            destinatario,
            apikey: this.apiKey,
            numeroMensajero: this.messengerNumber,
            variables: {}
        });
        console.log("body", body);
        const response = await fetch(this.endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });
        const payload = await this.parseResponse(response);
        if (!response.ok) {
            throw new MultichannelProviderError(payload.status?.message || `Multichannel request failed with status ${response.status}`, response.status, payload);
        }
        return payload;
    }
    async parseResponse(response) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return await response.json();
        }
        const message = await response.text();
        return {
            status: {
                code: response.ok ? 1 : 2,
                message,
            },
        };
    }
    normalizePhone(value) {
        const normalized = value?.replace(/\D/g, "");
        return normalized || undefined;
    }
}
export default MultichannelProvider;
export { MultichannelProvider, MultichannelProviderError };
