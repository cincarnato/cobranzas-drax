
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

}

export default OutboundEmailService
export {OutboundEmailService}
