import { AbstractService } from "@drax/crud-back";
class OutboundEmailService extends AbstractService {
    constructor(OutboundEmailRepository, baseSchema, fullSchema) {
        super(OutboundEmailRepository, baseSchema, fullSchema);
        this.repository = OutboundEmailRepository;
        this._validateOutput = true;
    }
    async findByInboundEmailIds(inboundEmailIds) {
        return await this.repository.findByInboundEmailIds(inboundEmailIds);
    }
    async findByMessageIds(messageIds) {
        return await this.repository.findByMessageIds(messageIds);
    }
    async standalonePaginate(options) {
        const page = Math.max(Number(options.page || 1), 1);
        const pageSize = Math.min(Math.max(Number(options.pageSize || 25), 1), 100);
        const result = await this.repository.standalonePaginate({ mailboxId: options.mailboxId, page, pageSize });
        return {
            items: result.items,
            page,
            pageSize,
            totalItems: result.totalItems,
            totalPages: Math.max(Math.ceil(result.totalItems / pageSize), 1),
        };
    }
}
export default OutboundEmailService;
export { OutboundEmailService };
