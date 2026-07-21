import {IDraxCrudRepository} from "@drax/crud-share";
import type {IEmailUserState, IEmailUserStateBase} from "./IEmailUserState";

interface IEmailUserStateRepository extends IDraxCrudRepository<IEmailUserState, IEmailUserStateBase, IEmailUserStateBase> {
    findByEmailAndUser(inboundEmailId: string, userId: string): Promise<IEmailUserState | null>
    upsertState(inboundEmailId: string, userId: string, data: Partial<IEmailUserStateBase>): Promise<IEmailUserState>
    findStarredEmailIds(userId: string): Promise<string[]>
}

export {IEmailUserStateRepository}
