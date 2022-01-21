import { Document, Model, model, Schema} from 'mongoose'
import * as shortid from 'shortid'

import { BusinessNeedsRecord } from '../interfaces/businessNeeds'

const BusinessNeedsBidsSchema: Schema = new Schema({
	proposal: String,
	expertise: {
		type: Schema.Types.ObjectId,
		ref: 'Expertise'
	},
	selectedPackage: Schema.Types.ObjectId
})

export interface BusinessNeedsModel extends BusinessNeedsRecord, Document {}
export const BusinessNeedsSchema: Schema = new Schema({
	shortId: {
		type: String,
		/* tslint:disable */
		'default': shortid.generate /* tslint:enable */
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	description: String,
	tags: [String],
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project'
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: 'ExpertiseCategory'
	},
	budgetMin: Number,
	budgetMax: Number,
	geography: {
		type: String,
		/* tslint:disable */'default': '--' /* tslint:enable */
	},
	bids: [BusinessNeedsBidsSchema],
	expertiseOrder: {
		type: Schema.Types.ObjectId,
		ref: 'ExpertiseOrder'
	}
}, {
	timestamps: true
})

export const BusinessNeedsSchemaModel: Model<BusinessNeedsModel> =
	model<BusinessNeedsModel>('BusinessNeeds', BusinessNeedsSchema)