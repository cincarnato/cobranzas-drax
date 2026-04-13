
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IPadron} from '../interfaces/IPadron'

const PadronSchema = new mongoose.Schema<IPadron>({
            origen: {type: String,   required: false, index: false, unique: false },
            ente: {type: Number,   required: false, index: false, unique: false },
            contra: {type: String,   required: true, index: true, unique: false },
            ape_nom: {type: String,   required: true, index: false, unique: false },
            cant_inte: {type: Number,   required: false, index: false, unique: false },
            plan_codi: {type: String,   required: false, index: false, unique: false },
            domicilio: {type: String,   required: false, index: false, unique: false },
            loca: {type: String,   required: false, index: false, unique: false },
            tele: {type: String,   required: false, index: false, unique: false },
            deuda1: {type: Number,   required: false, index: false, unique: false },
            deuda2: {type: Number,   required: false, index: false, unique: false },
            deuda3: {type: Number,   required: false, index: false, unique: false },
            deuda4: {type: Number,   required: false, index: false, unique: false },
            periodo1: {type: Date,   required: false, index: false, unique: false },
            periodo2: {type: Date,   required: false, index: false, unique: false },
            periodo3: {type: Date,   required: false, index: false, unique: false },
            periodo4: {type: Date,   required: false, index: false, unique: false },
            subtotal: {type: Number,   required: false, index: false, unique: false },
            pago_forma: {type: String,   required: false, index: false, unique: false },
            cobrador: {type: String,   required: false, index: false, unique: false },
            total_ctacte: {type: Number,   required: false, index: false, unique: false },
            baja_fecha: {type: Date,   required: false, index: false, unique: false },
            nro_ref_elect: {type: String,   required: false, index: false, unique: false },
            celular: {type: String,   required: false, index: false, unique: false },
            deno_provin: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

PadronSchema.plugin(uniqueValidator, {message: 'validation.unique'});
PadronSchema.plugin(mongoosePaginate);

PadronSchema.virtual("id").get(function () {
    return this._id.toString();
});


PadronSchema.set('toJSON', {getters: true, virtuals: true});

PadronSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Padron';
const COLLECTION_NAME = 'Padron';
const PadronModel = mongoose.model<IPadron, PaginateModel<IPadron>>(MODEL_NAME, PadronSchema,COLLECTION_NAME);

export {
    PadronSchema,
    PadronModel
}

export default PadronModel
