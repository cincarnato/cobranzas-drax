
import type {IMailbox, IMailboxBase} from './IMailbox'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IMailboxRepository extends IDraxCrudRepository<IMailbox, IMailboxBase, IMailboxBase>{

}

export {IMailboxRepository}


