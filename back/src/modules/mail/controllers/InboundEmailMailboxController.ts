import type {FastifyReply} from "fastify";
import {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import InboundEmailMailboxProvider from "../providers/InboundEmailMailboxProvider.js";
import type {InboundEmailSyncOptions} from "../providers/InboundEmailMailboxProvider.js";

type InboundEmailSyncRequestBody = {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
};

class InboundEmailMailboxController {
    private provider = InboundEmailMailboxProvider.instance;

    async sync(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission("mailbox:manage");

            const options = this.parseSyncOptions(request.body as InboundEmailSyncRequestBody | undefined);
            if ("error" in options) {
                return reply.status(400).send({
                    error: "INVALID_INBOUND_EMAIL_SYNC_OPTIONS",
                    message: options.error,
                });
            }

            console.log("[InboundEmailSync] Manual sync request", {
                body: request.body,
                parsedOptions: this.formatSyncOptionsForLog(options),
            });

            const result = await this.provider.syncAllEnabledMailboxes(options);
            return reply.status(200).send(result);
        } catch (error: any) {
            return reply.status(500).send({
                error: "INBOUND_EMAIL_SYNC_ERROR",
                message: error?.message || "Failed to sync inbound emails",
            });
        }
    }

    private parseSyncOptions(body?: InboundEmailSyncRequestBody): InboundEmailSyncOptions | { error: string } {
        const options: InboundEmailSyncOptions = {};

        if (body?.dateFrom) {
            const dateFrom = this.parseDateStart(body.dateFrom);
            if (!dateFrom) {
                return {error: "La fecha desde no es valida."};
            }
            options.dateFrom = dateFrom;
        }

        if (body?.dateTo) {
            const dateTo = this.parseDateEnd(body.dateTo);
            if (!dateTo) {
                return {error: "La fecha hasta no es valida."};
            }
            options.dateTo = dateTo;
        }

        if (options.dateFrom && options.dateTo && options.dateFrom > options.dateTo) {
            return {error: "La fecha desde no puede ser posterior a la fecha hasta."};
        }

        if (body?.limit !== undefined && body.limit !== null) {
            const limit = Number(body.limit);
            if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
                return {error: "El limite debe ser un numero entero entre 1 y 1000."};
            }
            options.limit = limit;
        }

        return options;
    }

    private formatSyncOptionsForLog(options: InboundEmailSyncOptions): Record<string, unknown> {
        return {
            dateFrom: options.dateFrom?.toISOString(),
            dateTo: options.dateTo?.toISOString(),
            limit: options.limit,
        };
    }

    private parseDateStart(value: string): Date | null {
        return this.parseDate(value, false);
    }

    private parseDateEnd(value: string): Date | null {
        return this.parseDate(value, true);
    }

    private parseDate(value: string, endOfDay: boolean): Date | null {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        const date = match
            ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0)
            : new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }
}

export default InboundEmailMailboxController;
export {InboundEmailMailboxController};
