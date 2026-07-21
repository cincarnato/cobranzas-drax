
import type {IOutboundEmail, IOutboundEmailBase} from './IOutboundEmail'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IOutboundEmailRepository extends IDraxCrudRepository<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase>{

}

export {IOutboundEmailRepository}


