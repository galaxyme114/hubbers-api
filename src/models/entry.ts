import * as mime from 'mime-types'
import { Schema } from 'mongoose'
import { EntryRecord } from '../interfaces/entry'

/**
 * Entry Helper Functions
 */
export const fillRawEntryModel = (rawEntryModel: any) => {
	if (rawEntryModel.attachments) {
		rawEntryModel.attachments.map(attachment => {
			if (!rawEntryModel.featuredImageUrl && mime.lookup(attachment.previewUrl).indexOf('image') !== -1) {
				rawEntryModel.featuredImageUrl = attachment.previewUrl
			}
		})
	}
	return rawEntryModel
}

/**
 * Entry Model
 */
const EntryAttachmentSchema: Schema = new Schema({
	title: String,
	caption: String,
	previewUrl: String,
	fileType: String,
	mimeType: String
})

const EntryRating: Schema = new Schema({
	judge: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	judgeId: {
		type: String,
		required: true
	},
	design: Number,
	designComment: String,
	functionality: Number,
	functionalityComment: String,
	usability: Number,
	usabilityComment: String,
	marketPotential: Number,
	marketPotentialComment: String,
	isSeen: Boolean,
	conversation: {
		type: Schema.Types.ObjectId,
		ref: 'Conversation'
	}
}, {
	timestamps: true
})

export interface EntryModel extends EntryRecord, Document {}
export const EntrySchema: Schema = new Schema({
	contest: {
		type: Schema.Types.ObjectId,
		ref: 'Contest'
	},
	contestant: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	contestantId: {
		type: String
		// required: true
	},
	conversation: {
		type: Schema.Types.ObjectId,
		ref: 'Conversation'
	},
	title: {
		type: String
	},
	descriptionDesign: {
		type: String
	},
	descriptionFunctionality: {
		type: String
	},
	descriptionUsability: {
		type: String
	},
	descriptionMarketPotential: {
		type: String
	},
	isDraft: {
		type: Boolean,
		/* tslint:disable */
		default: true /* tslint:enable  */
	},
	attachments: [EntryAttachmentSchema],
	ratings: [EntryRating]
}, {
	timestamps: true
})

EntryAttachmentSchema.pre('init', (doc: any) => {
	if (doc.previewUrl) {
		doc.mimeType = mime.lookup(doc.previewUrl)
	}
})

EntrySchema.pre('init', (doc: any) => {
	fillRawEntryModel(doc)
})