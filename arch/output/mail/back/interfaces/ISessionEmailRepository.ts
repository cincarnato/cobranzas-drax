
import type {ISessionEmail, ISessionEmailBase} from './ISessionEmail'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ISessionEmailRepository extends IDraxCrudRepository<ISessionEmail, ISessionEmailBase, ISessionEmailBase>{

}

export {ISessionEmailRepository}


