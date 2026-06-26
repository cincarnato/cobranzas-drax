
import {AbstractCrudRestProvider} from "@drax/crud-front";
import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";
import type {IPadron, IPadronBase} from '../interfaces/IPadron'

export type PadronImportFile = {
  url?: string
  filename?: string
  filepath?: string
  mimetype?: string
}

export type PadronImportResult = {
  status: "success"
  rowCount: number
  time: number
  message: string
}

class PadronProvider extends AbstractCrudRestProvider<IPadron, IPadronBase, IPadronBase> {
    
  static singleton: PadronProvider
  httpClient: IHttpClient
    
  constructor() {
   super('/api/padrones')
   this.httpClient = HttpRestClientFactory.getInstance()
  }
  
  static get instance() {
    if(!PadronProvider.singleton){
      PadronProvider.singleton = new PadronProvider()
    }
    return PadronProvider.singleton
  }

  async importFile(file: PadronImportFile): Promise<PadronImportResult> {
    return await this.httpClient.post(
      "/api/padrones/import-file",
      {file},
      {timeout: 600000}
    ) as PadronImportResult
  }

}

export default PadronProvider
