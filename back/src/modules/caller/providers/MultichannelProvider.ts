
interface MultichannelWhatsappTemplateVariables {
    [key: string]: string;
}

interface SendWhatsappTemplateParams {
    destinatario: string;
    template: string;
    variables?: MultichannelWhatsappTemplateVariables;
}

interface MultichannelStatusResponse {
    code: number;
    message: string;
}

interface MultichannelSendWhatsappTemplateResponse {
    data?: string[];
    status: MultichannelStatusResponse;
}

class MultichannelProviderError extends Error {
    statusCode: number;
    payload?: MultichannelSendWhatsappTemplateResponse;

    constructor(message: string, statusCode: number, payload?: MultichannelSendWhatsappTemplateResponse) {
        super(message);
        this.name = 'MultichannelProviderError';
        this.statusCode = statusCode;
        this.payload = payload;
    }
}

class MultichannelProvider {
    private readonly endpointUrl: string;
    private readonly apiKey: string;
    private readonly messengerNumber: string;

    constructor(
        apiKey: string,
        messengerNumber: string,
        endpointUrl = 'https://multicapi.sondeosglobal.com/webServiceMessage'
    ) {
        this.apiKey = apiKey;
        this.messengerNumber = messengerNumber;
        this.endpointUrl = endpointUrl;
    }

    async sendWhatsappTemplate(
        params: SendWhatsappTemplateParams
    ): Promise<MultichannelSendWhatsappTemplateResponse> {
        const destinatario = this.normalizePhone(params.destinatario);

        if (!destinatario) {
            throw new MultichannelProviderError(
                'El número de destinatario es inválido.',
                400,
                {
                    status: {
                        code: 2,
                        message: 'El número de destinatario es inválido.',
                    },
                }
            );
        }

        const body = JSON.stringify({
            ...params,
            destinatario,
            apikey: this.apiKey,
            numeroMensajero: this.messengerNumber,
            variables: {}
        })

        console.log("body",body);

        const response = await fetch(this.endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });

        const payload = await this.parseResponse(response);

        if (!response.ok) {
            throw new MultichannelProviderError(
                payload.status?.message || `Multichannel request failed with status ${response.status}`,
                response.status,
                payload
            );
        }

        return payload;
    }

    private async parseResponse(response: Response): Promise<MultichannelSendWhatsappTemplateResponse> {
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            return await response.json() as MultichannelSendWhatsappTemplateResponse;
        }

        const message = await response.text();
        return {
            status: {
                code: response.ok ? 1 : 2,
                message,
            },
        };
    }

    private normalizePhone(value?: string): string | undefined {
        const normalized = value?.replace(/\D/g, "");
        return normalized || undefined;
    }
}

export default MultichannelProvider;
export {
    MultichannelProvider,
    MultichannelProviderError
}
export type {
    MultichannelSendWhatsappTemplateResponse,
    MultichannelStatusResponse,
    MultichannelWhatsappTemplateVariables,
    SendWhatsappTemplateParams
}
