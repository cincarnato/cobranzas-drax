
import type {IWhatsappMessage, IWhatsappMessageBase} from './IWhatsappMessage'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IWhatsappMessageRepository extends IDraxCrudRepository<IWhatsappMessage, IWhatsappMessageBase, IWhatsappMessageBase>{

}

export {IWhatsappMessageRepository}


