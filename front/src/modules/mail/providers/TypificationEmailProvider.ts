
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITypificationEmail, ITypificationEmailBase} from '../interfaces/ITypificationEmail'

class TypificationEmailProvider extends AbstractCrudRestProvider<ITypificationEmail, ITypificationEmailBase, ITypificationEmailBase> {
    
  static singleton: TypificationEmailProvider
    
  constructor() {
   super('/api/typification-emails')
  }
  
  static get instance() {
    if(!TypificationEmailProvider.singleton){
      TypificationEmailProvider.singleton = new TypificationEmailProvider()
    }
    return TypificationEmailProvider.singleton
  }

}

export default TypificationEmailProvider

