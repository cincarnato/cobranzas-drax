import { AbstractSqliteRepository } from "@drax/crud-back";
class MailboxUserSettingSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'MailboxUserSetting';
        this.searchFields = [];
        this.booleanFields = ['autoAdvanceOnClose'];
        this.jsonFields = [];
        this.identifier = 'mailbox';
        this.populateFields = [
            { field: 'mailbox', table: 'mailbox', identifier: '_id' },
            { field: 'user', table: 'user', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "mailbox", type: "TEXT", unique: undefined, primary: false },
            { name: "user", type: "TEXT", unique: undefined, primary: false },
            { name: "signatureHtml", type: "TEXT", unique: undefined, primary: false },
            { name: "signatureText", type: "TEXT", unique: undefined, primary: false },
            { name: "autoAdvanceOnClose", type: "TEXT", unique: undefined, primary: false }
        ];
    }
    async findByMailboxAndUser(mailboxId, userId) {
        const item = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE mailbox = ? AND user = ? LIMIT 1`).get(mailboxId, userId);
        if (item)
            await this.decorate(item);
        return item || null;
    }
    async upsertForMailboxAndUser(mailboxId, userId, data) {
        const current = await this.findByMailboxAndUser(mailboxId, userId);
        if (current?._id) {
            return await this.update(current._id, { ...current, ...data, mailbox: mailboxId, user: userId });
        }
        return await this.create({ mailbox: mailboxId, user: userId, signatureHtml: "", signatureText: "", autoAdvanceOnClose: false, ...data });
    }
}
export default MailboxUserSettingSqliteRepository;
export { MailboxUserSettingSqliteRepository };
