
import type {IBankMovement, IBankMovementBase} from './IBankMovement'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IBankMovementRepository extends IDraxCrudRepository<IBankMovement, IBankMovementBase, IBankMovementBase>{

}

export {IBankMovementRepository}


