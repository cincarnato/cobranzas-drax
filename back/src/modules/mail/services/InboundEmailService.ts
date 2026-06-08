
import type{
    FindInboundEmailsByProcessMarkOptions,
    IInboundEmailRepository
} from "../interfaces/IInboundEmailRepository";
import type {IInboundEmailBase, IInboundEmail} from "../interfaces/IInboundEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class InboundEmailService extends AbstractService<IInboundEmail, IInboundEmailBase, IInboundEmailBase> {


    constructor(InboundEmailRepository: IInboundEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(InboundEmailRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

    async findByProcessMarkStatus(options: FindInboundEmailsByProcessMarkOptions): Promise<IInboundEmail[]> {
        const items = await (this._repository as IInboundEmailRepository).findByProcessMarkStatus(options);
        const validatedItems: IInboundEmail[] = [];

        for (const item of items) {
            const transformedItem = this.transformRead ? await this.transformRead(item) : item;
            validatedItems.push(await this.validateOutput(transformedItem));
        }

        return validatedItems;
    }

}

export default InboundEmailService
export {InboundEmailService}
