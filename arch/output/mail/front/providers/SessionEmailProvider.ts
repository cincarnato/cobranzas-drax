
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ISessionEmail, ISessionEmailBase} from '../interfaces/ISessionEmail'

class SessionEmailProvider extends AbstractCrudRestProvider<ISessionEmail, ISessionEmailBase, ISessionEmailBase> {
    
  static singleton: SessionEmailProvider
    
  constructor() {
   super('/api/session-emails')
  }
  
  static get instance() {
    if(!SessionEmailProvider.singleton){
      SessionEmailProvider.singleton = new SessionEmailProvider()
    }
    return SessionEmailProvider.singleton
  }

}

export default SessionEmailProvider

