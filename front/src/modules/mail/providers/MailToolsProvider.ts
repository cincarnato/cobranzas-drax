import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";

export type MailToolFile = {
  url?: string
  filename?: string
  filepath?: string
  mimetype?: string
}

export type MailToolsExtractTextResult = {
  tool: string
  mimetype?: string | null
  filename?: string | null
  filepath: string
  text: string
}

class MailToolsProvider {
  static singleton: MailToolsProvider

  httpClient: IHttpClient
  basePath = "/api/mail-tools"

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!MailToolsProvider.singleton) {
      MailToolsProvider.singleton = new MailToolsProvider()
    }
    return MailToolsProvider.singleton
  }

  async extractText(file: MailToolFile): Promise<MailToolsExtractTextResult> {
    return await this.httpClient.post(
      `${this.basePath}/extract-text`,
      {file},
      {timeout: 600000}
    ) as MailToolsExtractTextResult
  }
}

export default MailToolsProvider
