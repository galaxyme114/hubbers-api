import { Document, Model, model, Schema} from 'mongoose'
import { ConversationMessageRecord } from '../interfaces/conversation'

/**
 * Conversation Message Model
 */
export interface ConversationMessageModel extends ConversationMessageRecord, Document {}
export const ConversationMessageSchema: Schema = new Schema({
	conversation: {
		type: Schema.Types.ObjectId,
		ref: 'Conversation',
		required: true
	},
	message: {
		type: String,
		required: true
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
}, {
	timestamps: true
})

export const ConversationMessageSchemaModel: Model<ConversationMessageModel> =
	model<ConversationMessageModel>('ConversationMessage', ConversationMessageSchema)