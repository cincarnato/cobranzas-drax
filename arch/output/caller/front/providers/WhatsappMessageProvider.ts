
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IWhatsappMessage, IWhatsappMessageBase} from '../interfaces/IWhatsappMessage'

class WhatsappMessageProvider extends AbstractCrudRestProvider<IWhatsappMessage, IWhatsappMessageBase, IWhatsappMessageBase> {
    
  static singleton: WhatsappMessageProvider
    
  constructor() {
   super('/api/whatsapp-messages')
  }
  
  static get instance() {
    if(!WhatsappMessageProvider.singleton){
      WhatsappMessageProvider.singleton = new WhatsappMessageProvider()
    }
    return WhatsappMessageProvider.singleton
  }

}

export default WhatsappMessageProvider

