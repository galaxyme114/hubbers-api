import { Document, Model, model, Schema} from 'mongoose'
import * as shortid from 'shortid'
import { EmailSettingsRecord } from '../interfaces/emailSettings'

/**
 * Model to store email settings for a user
 */
export interface EmailSettingsModel extends EmailSettingsRecord, Document {}
export const EmailSettingsSchema: Schema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	shortId: {
		type: String,
		/* tslint:disable */
		'default': shortid.generate /* tslint:enable */
	},
	allEmails: {
		type: Boolean,
		/* tslint:disable */'default': true /* tslint:enable */
	},
	accessCodes: [String]
}, {
	timestamps: true
})

export const EmailSettingsSchemaModel: Model<EmailSettingsModel> =
	model<EmailSettingsModel>('EmailSettings', EmailSettingsSchema)