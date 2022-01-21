import { Document, Model, model, Schema} from 'mongoose'
import * as shortid from 'shortid'

import { ExpertiseOrderRecord } from '../interfaces/expertise'
import { Purchasable } from '../interfaces/purchaseOrder'

/**
 * Invitation Model for Expertise
 */
const BriefDataFieldSchema: Schema = new Schema({
	name: String,
	value: String
}, { _id: false })

const ExpertiseOrderAttachmentSchema: Schema = new Schema({
	title: String,
	caption: String,
	previewUrl: String,
	fileType: String
})

const BriefDataSchema: Schema = new Schema({
	nda: Boolean,
	attachments: [ExpertiseOrderAttachmentSchema],
	additionalInfo: String,
	fields: [BriefDataFieldSchema],
	lastUpdated: Date
})

const OfferSchema: Schema = new Schema({
	name: String,
	currency: String,
	breakdown: [{
		name: String,
		delivery: Number,
		price: Number,
		selected: Boolean
	}],
	selected: Boolean
})

export interface ExpertiseOrderModel extends ExpertiseOrderRecord, Document {}
export const ExpertiseOrderSchema: Schema = new Schema({
	sku: {
		type: String,
		/* tslint:disable */
		'default': shortid.generate /* tslint:enable */
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project'
	},
	expertise: {
		type: Schema.Types.ObjectId,
		ref: 'Expertise'
	},
	conversation: {
		type: Schema.Types.ObjectId,
		ref: 'Conversation'
	},
	briefData: BriefDataSchema,
	offers: [OfferSchema],
	completed: {
		type: Boolean,
		/* tslint:disable */
		'default': false /* tslint:enable */
	},
	selectedPackage: Schema.Types.ObjectId,
	createdAt: Date,
	completedAt: Date
})

export const ExpertiseOrderSchemaModel: Model<ExpertiseOrderModel> =
	model<ExpertiseOrderModel>('ExpertiseOrder', ExpertiseOrderSchema)