import {
	HBE003_FAILED_TO_FETCH,
	HBE004_FAILED_TO_CREATE, HBE006_FAILED_TO_UPDATE,
	HBE007_FAILED_TO_DELETE
} from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { TransactionRecord } from '../interfaces/transaction'
import { TransactionModel, TransactionSchemaModel } from '../models/transaction'
import { convertCurrencyToUSD } from '../utils/currency'

export const fetchUserAssets = (userId: string) => {
	return new Promise((resolve, reject) => {
		TransactionSchemaModel.find({ user: userId })
			.sort('-createdAt')
			.then((transactions: TransactionRecord[]) => {
				// Sort transactions by type
				let totalAssets = 0
				let valueIncrease = 0
				
				const transactionTypes = {
					hbs: { totalAmount: 0, transactions: [] },
					hbb: { totalAmount: 0, transactions: [] },
					usd: { totalAmount: 0, transactions: [] }
				}
				
				transactions.map(t => {
					if (typeof(transactionTypes[t.currency]) === 'undefined') {
						transactionTypes[t.currency] = { totalAmount: 0, transactions: [] }
					}
					
					const currentValue = convertCurrencyToUSD(t.amount, t.currency)
					const previousValue = t.amount * t.usdAmount
					const valueChange = ((currentValue - previousValue) / previousValue) * 100
					
					totalAssets += currentValue
					valueIncrease += valueChange
					transactionTypes[t.currency].totalAmount += t.amount
					transactionTypes[t.currency].transactions.push(t)
				})
				
				resolve({ totalAssets, valueIncrease, transactionTypes })
			}).catch(error => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

export const fetchUserTransactions = (userId: string) => {
	return new Promise((resolve, reject) => {
		TransactionSchemaModel.find({ user: userId })
			.sort('-createdAt')
			.then((transactions: TransactionRecord[]) => resolve(transactions))
			.catch(error => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

export const fetchUserTransaction = (transactionId: string, userId?: string) => {
	return new Promise((resolve, reject) => {
		TransactionSchemaModel.findOne(userId ? { user: userId, _id: transactionId } : { _id: transactionId })
			.then((transaction: TransactionRecord) => resolve(transaction))
			.catch(error => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

export const createUserTransaction = (userId: string, transactionData: Partial<TransactionRecord>) => {
	return new Promise(async (resolve, reject) => {
		const transaction = new TransactionSchemaModel({ user: userId, ...transactionData })
		transaction.save()
			.then((updatedTransaction: TransactionModel) => resolve(updatedTransaction))
			.catch(error => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}

export const updateUserTransaction = (transactionId: string, transactionData: Partial<TransactionRecord>) => {
	return new Promise((resolve, reject) => {
		TransactionSchemaModel.findOneAndUpdate({ _id: transactionId }, transactionData, { new: true })
			.then((transaction: TransactionModel) => resolve(transaction))
			.catch(error => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

export const removeUserTransaction = (transactionId: string) => {
	return new Promise((resolve, reject) => {
		TransactionSchemaModel.findOneAndRemove({ _id: transactionId })
			.then((transaction: TransactionModel) => resolve(transaction))
			.catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
	})
}