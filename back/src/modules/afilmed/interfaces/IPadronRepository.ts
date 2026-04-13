
import type {IPadron, IPadronBase} from './IPadron'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IPadronRepository extends IDraxCrudRepository<IPadron, IPadronBase, IPadronBase>{

}

export {IPadronRepository}


