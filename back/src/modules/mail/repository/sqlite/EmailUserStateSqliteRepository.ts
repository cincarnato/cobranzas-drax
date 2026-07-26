import {AbstractSqliteRepository} from "@drax/crud-back";
import {SqliteTableField} from "@drax/common-back";
import type {IEmailUserStateRepository} from "../../interfaces/IEmailUserStateRepository";
import type {IEmailUserState, IEmailUserStateBase} from "../../interfaces/IEmailUserState";

class EmailUserStateSqliteRepository extends AbstractSqliteRepository<IEmailUserState, IEmailUserStateBase, IEmailUserStateBase> implements IEmailUserStateRepository {
    protected db: any;
    protected tableName = 'EmailUserState';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = ['isRead', 'isStarred'];
    protected jsonFields: string[] = [];
    protected identifier = 'inboundEmail';
    protected populateFields = [];
    protected verbose = false;
    protected tableFields: SqliteTableField[] = [
        {name: "inboundEmail", type: "TEXT", unique: undefined, primary: false},
        {name: "user", type: "TEXT", unique: undefined, primary: false},
        {name: "isRead", type: "TEXT", unique: undefined, primary: false},
        {name: "readAt", type: "TEXT", unique: undefined, primary: false},
        {name: "isStarred", type: "TEXT", unique: undefined, primary: false},
    ];

    async findByEmailAndUser(inboundEmailId: string, userId: string): Promise<IEmailUserState | null> {
        const item = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE inboundEmail = ? AND user = ? LIMIT 1`).get(inboundEmailId, userId) as IEmailUserState | undefined;
        if (item) await this.decorate(item);
        return item || null;
    }

    async upsertState(inboundEmailId: string, userId: string, data: Partial<IEmailUserStateBase>): Promise<IEmailUserState> {
        const current = await this.findByEmailAndUser(inboundEmailId, userId);
        const payload = {...data, readAt: data.isRead && !data.readAt ? new Date() : data.readAt};
        if (current?._id) {
            return await this.update(current._id, {...current, ...payload});
        }
        return await this.create({inboundEmail: inboundEmailId, user: userId, isRead: false, isStarred: false, ...payload});
    }

    async findStarredEmailIds(userId: string): Promise<string[]> {
        const rows = this.db.prepare(`SELECT inboundEmail FROM ${this.tableName} WHERE user = ? AND isStarred = 'true'`).all(userId) as Array<{inboundEmail: string}>;
        return rows.map((row) => row.inboundEmail);
    }
}

export default EmailUserStateSqliteRepository
export {EmailUserStateSqliteRepository}
