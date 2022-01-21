import {
	createUserTransaction,
	fetchUserAssets,
	fetchUserTransaction,
	fetchUserTransactions, removeUserTransaction, updateUserTransaction
} from '../controllers/transactions'
import { check } from 'express-validator/check'
import { requestValidator } from '../middlewares/errorHandler'

/**
 * Express route for fetching a logged in user's transactions
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const index = (req, res, next) => {
	const userId = req.user.id
	
	fetchUserAssets(userId)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for fetching a logged in user's transaction
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetch = (req, res, next) => {
	const userId = req.user.id
	const transactionId = req.params.transactionId
	
	fetchUserTransaction(transactionId, userId)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for fetching a user's transactions
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminIndex = (req, res, next) => {
	const userId = req.params.userId
	
	fetchUserTransactions(userId)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for fetching a logged in user's transaction
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetch = (req, res, next) => {
	const transactionId = req.params.transactionId
	
	fetchUserTransaction(transactionId)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for creating a users' transaction
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const createMiddleware = [
	check('type').not().isEmpty(),
	check('amount').not().isEmpty(),
	check('currency').not().isEmpty(),
	check('usdAmount').not().isEmpty(),
	check('userId').not().isEmpty(),
	requestValidator
]
export const adminCreate = (req, res, next) => {
	const userId = req.params.userId
	const transactionData = req.body

	createUserTransaction(userId, transactionData)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for updating a users' transaction
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateMiddleware = [
	check('type').not().isEmpty(),
	check('amount').not().isEmpty(),
	check('currency').not().isEmpty(),
	check('usdAmount').not().isEmpty(),
	check('userId').not().isEmpty(),
	check('status').not().isEmpty(),
	requestValidator
]
export const adminUpdate = (req, res, next) => {
	const transactionId = req.params.transactionId
	const transactionData = req.body
	
	updateUserTransaction(transactionId, transactionData)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for updating a users' transaction
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminRemove = (req, res, next) => {
	const transactionId = req.params.transactionId
	
	removeUserTransaction(transactionId)
		.then(response => res.json(response))
		.catch(error => next(error))
}