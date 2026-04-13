
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IAffiliateType} from '../interfaces/IAffiliateType'

const AffiliateTypeSchema = new mongoose.Schema<IAffiliateType>({
            nombre: {type: String,   required: true, index: true, unique: false },
            descripcion: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

AffiliateTypeSchema.plugin(uniqueValidator, {message: 'validation.unique'});
AffiliateTypeSchema.plugin(mongoosePaginate);

AffiliateTypeSchema.virtual("id").get(function () {
    return this._id.toString();
});


AffiliateTypeSchema.set('toJSON', {getters: true, virtuals: true});

AffiliateTypeSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'AffiliateType';
const COLLECTION_NAME = 'AffiliateType';
const AffiliateTypeModel = mongoose.model<IAffiliateType, PaginateModel<IAffiliateType>>(MODEL_NAME, AffiliateTypeSchema,COLLECTION_NAME);

export {
    AffiliateTypeSchema,
    AffiliateTypeModel
}

export default AffiliateTypeModel
