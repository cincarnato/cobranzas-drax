
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IInboundEmail, IInboundEmailBase} from '../interfaces/IInboundEmail'

class InboundEmailProvider extends AbstractCrudRestProvider<IInboundEmail, IInboundEmailBase, IInboundEmailBase> {
    
  static singleton: InboundEmailProvider
    
  constructor() {
   super('/api/inbound-emails')
  }
  
  static get instance() {
    if(!InboundEmailProvider.singleton){
      InboundEmailProvider.singleton = new InboundEmailProvider()
    }
    return InboundEmailProvider.singleton
  }

}

export default InboundEmailProvider

