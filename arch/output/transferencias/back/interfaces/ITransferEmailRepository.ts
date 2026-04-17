
import type {ITransferEmail, ITransferEmailBase} from './ITransferEmail'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITransferEmailRepository extends IDraxCrudRepository<ITransferEmail, ITransferEmailBase, ITransferEmailBase>{

}

export {ITransferEmailRepository}


