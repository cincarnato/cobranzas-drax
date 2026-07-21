
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IOutboundEmail, IOutboundEmailBase} from '../interfaces/IOutboundEmail'

class OutboundEmailProvider extends AbstractCrudRestProvider<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase> {
    
  static singleton: OutboundEmailProvider
    
  constructor() {
   super('/api/outbound-emails')
  }
  
  static get instance() {
    if(!OutboundEmailProvider.singleton){
      OutboundEmailProvider.singleton = new OutboundEmailProvider()
    }
    return OutboundEmailProvider.singleton
  }

}

export default OutboundEmailProvider

