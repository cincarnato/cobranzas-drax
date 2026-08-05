
import type {ITemplateEmail, ITemplateEmailBase} from './ITemplateEmail'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITemplateEmailRepository extends IDraxCrudRepository<ITemplateEmail, ITemplateEmailBase, ITemplateEmailBase>{

}

export {ITemplateEmailRepository}


