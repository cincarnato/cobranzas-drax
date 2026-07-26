
import type{IOutboundEmailRepository} from "../interfaces/IOutboundEmailRepository";
import type {IOutboundEmailBase, IOutboundEmail} from "../interfaces/IOutboundEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class OutboundEmailService extends AbstractService<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase> {
    private repository: IOutboundEmailRepository;

    constructor(OutboundEmailRepository: IOutboundEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(OutboundEmailRepository, baseSchema, fullSchema);
        this.repository = OutboundEmailRepository;
        
        this._validateOutput = true
        
    }

    async findByInboundEmailIds(inboundEmailIds: string[]): Promise<IOutboundEmail[]> {
        return await this.repository.findByInboundEmailIds(inboundEmailIds);
    }

    async findByMessageIds(messageIds: string[]): Promise<IOutboundEmail[]> {
        return await this.repository.findByMessageIds(messageIds);
    }

    async standalonePaginate(options: {mailboxId: string, page: number, pageSize: number}) {
        const page = Math.max(Number(options.page || 1), 1);
        const pageSize = Math.min(Math.max(Number(options.pageSize || 25), 1), 100);
        const result = await this.repository.standalonePaginate({mailboxId: options.mailboxId, page, pageSize});
        return {
            items: result.items,
            page,
            pageSize,
            totalItems: result.totalItems,
            totalPages: Math.max(Math.ceil(result.totalItems / pageSize), 1),
        };
    }

}

export default OutboundEmailService
export {OutboundEmailService}
