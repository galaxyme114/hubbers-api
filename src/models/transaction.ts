import { Document, Model, model, Schema} from 'mongoose'
import * as shortid from 'shortid'
import { TransactionRecord } from '../interfaces/transaction'

/**
 * Transactions
 */
export interface TransactionModel extends TransactionRecord, Document {}
export const TransactionSchema: Schema = new Schema({
	userId: {
		type: String
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	txId: {
		type: String,
		default: shortid.generate
	},
	amount: {
		type: Number,
		required: true
	},
	currency: {
		type: String,
		required: true
	},
	usdAmount: {
		type: Number,
		required: true
	},
	type: {
		type: String,
		default: ''
	},
	status: {
		type: String,
		default: 'PENDING'
	},
	silent: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true
})

export const TransactionSchemaModel: Model<TransactionModel> =
	model<TransactionModel>('Transaction', TransactionSchema)