import { Document, Model, model, Schema} from 'mongoose'
import { ConversationRecord } from '../interfaces/conversation'

/**
 * Conversation Model
 */
export interface ConversationModel extends ConversationRecord, Document {}
export const ConversationSchema: Schema = new Schema({
	name: {
		type: String
		// required: true
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	participants: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	category: {
		type: String,
		/* tslint:disable */'default': '--' /* tslint:enable */
	}
}, {
	timestamps: true
})

export const ConversationSchemaModel: Model<ConversationModel> =
	model<ConversationModel>('Conversation', ConversationSchema)