import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";

export type MultichannelWhatsappTemplateVariables = Record<string, string>

export type SendWhatsappTemplatePayload = {
  destinatario: string
  template: string
  variables?: MultichannelWhatsappTemplateVariables
}

export type MultichannelSendWhatsappTemplateResponse = {
  data?: string[]
  status: {
    code: number
    message: string
  }
}

class MultichannelProvider {
  static singleton: MultichannelProvider

  httpClient: IHttpClient
  basePath = "/api/multichannel"

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!MultichannelProvider.singleton) {
      MultichannelProvider.singleton = new MultichannelProvider()
    }
    return MultichannelProvider.singleton
  }

  async sendWhatsappTemplate(payload: SendWhatsappTemplatePayload): Promise<MultichannelSendWhatsappTemplateResponse> {
    return await this.httpClient.post(
      `${this.basePath}/send-whatsapp-template`,
      payload,
      {timeout: 120000}
    ) as MultichannelSendWhatsappTemplateResponse
  }
}

export default MultichannelProvider
