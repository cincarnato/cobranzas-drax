
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITemplateEmail, ITemplateEmailBase} from '../interfaces/ITemplateEmail'

class TemplateEmailProvider extends AbstractCrudRestProvider<ITemplateEmail, ITemplateEmailBase, ITemplateEmailBase> {
    
  static singleton: TemplateEmailProvider
    
  constructor() {
   super('/api/template-emails')
  }
  
  static get instance() {
    if(!TemplateEmailProvider.singleton){
      TemplateEmailProvider.singleton = new TemplateEmailProvider()
    }
    return TemplateEmailProvider.singleton
  }

}

export default TemplateEmailProvider

