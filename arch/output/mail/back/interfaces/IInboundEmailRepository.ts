
import type {IInboundEmail, IInboundEmailBase} from './IInboundEmail'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IInboundEmailRepository extends IDraxCrudRepository<IInboundEmail, IInboundEmailBase, IInboundEmailBase>{

}

export {IInboundEmailRepository}


