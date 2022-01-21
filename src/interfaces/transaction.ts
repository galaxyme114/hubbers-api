import { UserModel } from '../models/user'
import { UserRecord } from './user'

export interface TransactionRecord {
	user: string | UserModel | UserRecord
	txId: string
	amount: number
	currency: string
	usdAmount: number
	type: string
	status: string // pending; completed; revoked
	silent: boolean
}