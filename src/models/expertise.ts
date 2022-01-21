import { Document, Model, model, Schema} from 'mongoose'
import * as shortid from 'shortid'

import { ExpertiseCategoryRecord, ExpertiseRecord } from '../interfaces/expertise'

/**
 * Invitation Model for Expertise
 */
const PackageSchema: Schema = new Schema({
	name: String,
	price: Number,
	currency: String,
	description: String,
	availability: String,
	delivery: Number
})

const FAQSchema: Schema = new Schema({
	title: String,
	answer: String
}, { _id: false })

const BriefTemplateFieldRecord: Schema = new Schema({
	name: String,
	formType: String
}, { _id: false })

const BriefTemplateSchema: Schema = new Schema({
	nda: Boolean,
	attachments: Boolean,
	additionalInfo: Boolean,
	fields: [BriefTemplateFieldRecord],
	version: Number
})

const ReviewSchema: Schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	rating: Number,
	body: String
}, {timestamps: true})

export interface ExpertiseModel extends ExpertiseRecord, Document {
	category: ExpertiseCategoryRecord
}
export const ExpertiseSchema: Schema = new Schema({
	shortId: {
		type: String,
		/* tslint:disable */
		'default': shortid.generate /* tslint:enable */
	},
	name: String,
	slug: String,
	featuredImageUrl: String,
	gallery: [String],
	rating: Number,
	reviews: [ReviewSchema],
	tags: [String],
	about: String,
	faq: [FAQSchema],
	category: {
		type: Schema.Types.ObjectId,
		ref: 'ExpertiseCategory'
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	packages: [PackageSchema],
	briefTemplate: BriefTemplateSchema,
	isDraft: {
		type: Boolean,
		/* tslint:disable */
		'default': true /* tslint:enable */
	}
}, {
	timestamps: true
})

ExpertiseSchema.pre('init', (doc: any) => {
	if (!doc.featuredImageUrl && doc.gallery.length > 0) {
		doc.featuredImageUrl = doc.gallery[0]
	}

	if (doc.featuredImageUrl && doc.gallery.length === 0) {
		doc.gallery = [doc.featuredImageUrl]
	}
})

export const ExpertiseSchemaModel: Model<ExpertiseModel> =
	model<ExpertiseModel>('Expertise', ExpertiseSchema)