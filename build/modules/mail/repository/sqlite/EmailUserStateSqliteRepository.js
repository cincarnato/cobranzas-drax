import { AbstractSqliteRepository } from "@drax/crud-back";
class EmailUserStateSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'EmailUserState';
        this.searchFields = [];
        this.booleanFields = ['isRead', 'isStarred'];
        this.jsonFields = [];
        this.identifier = 'inboundEmail';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "inboundEmail", type: "TEXT", unique: undefined, primary: false },
            { name: "user", type: "TEXT", unique: undefined, primary: false },
            { name: "isRead", type: "TEXT", unique: undefined, primary: false },
            { name: "readAt", type: "TEXT", unique: undefined, primary: false },
            { name: "isStarred", type: "TEXT", unique: undefined, primary: false },
        ];
    }
    async findByEmailAndUser(inboundEmailId, userId) {
        const item = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE inboundEmail = ? AND user = ? LIMIT 1`).get(inboundEmailId, userId);
        if (item)
            await this.decorate(item);
        return item || null;
    }
    async upsertState(inboundEmailId, userId, data) {
        const current = await this.findByEmailAndUser(inboundEmailId, userId);
        const payload = { ...data, readAt: data.isRead && !data.readAt ? new Date() : data.readAt };
        if (current?._id) {
            return await this.update(current._id, { ...current, ...payload });
        }
        return await this.create({ inboundEmail: inboundEmailId, user: userId, isRead: false, isStarred: false, ...payload });
    }
    async findStarredEmailIds(userId) {
        const rows = this.db.prepare(`SELECT inboundEmail FROM ${this.tableName} WHERE user = ? AND isStarred = 'true'`).all(userId);
        return rows.map((row) => row.inboundEmail);
    }
}
export default EmailUserStateSqliteRepository;
export { EmailUserStateSqliteRepository };
