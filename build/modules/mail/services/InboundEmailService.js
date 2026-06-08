import { AbstractService } from "@drax/crud-back";
class InboundEmailService extends AbstractService {
    constructor(InboundEmailRepository, baseSchema, fullSchema) {
        super(InboundEmailRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
    async findByProcessMarkStatus(options) {
        const items = await this._repository.findByProcessMarkStatus(options);
        const validatedItems = [];
        for (const item of items) {
            const transformedItem = this.transformRead ? await this.transformRead(item) : item;
            validatedItems.push(await this.validateOutput(transformedItem));
        }
        return validatedItems;
    }
}
export default InboundEmailService;
export { InboundEmailService };
