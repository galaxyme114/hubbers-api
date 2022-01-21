import { Document, Model, model, Schema } from 'mongoose'
import { SMSVerificationRecord } from '../interfaces/smsVerification'

/**
 * SMS Verification Model
 */
export interface SMSVerificationModel extends SMSVerificationRecord, Document {}
export const SMSVerificationSchema: Schema = new Schema({
	phoneNumber: {
		type: String,
		required: true
	},
	phoneNumberCountryCode: {
		type: String,
		required: true
	},
	smsCode: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})

export const SMSVerificationSchemaModel: Model<SMSVerificationModel> =
	model<SMSVerificationModel>('SMSVerification', SMSVerificationSchema)