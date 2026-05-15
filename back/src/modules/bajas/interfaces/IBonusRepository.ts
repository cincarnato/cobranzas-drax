
import type {IBonus, IBonusBase} from './IBonus'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IBonusRepository extends IDraxCrudRepository<IBonus, IBonusBase, IBonusBase>{

}

export {IBonusRepository}


