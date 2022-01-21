import { setupCache } from 'axios-cache-adapter'
import { check } from 'express-validator/check'

import { fetchEmailSettings, updateEmailSettings } from '../controllers/emailSettings'
import { requestValidator } from '../middlewares/errorHandler'

/**
 * Express route for fetching a single email settings
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetch = (req, res, next) => {
	const shortId = req.params.shortId
	const accessCode = req.params.accessCode

	fetchEmailSettings(shortId, accessCode)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express route for updating a single user's email settings
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateEmailSettingsMiddleware = [
	check('allEmails').exists(), check('allEmails').isBoolean(), requestValidator
]
export const update = (req, res, next) => {
	const shortId = req.params.shortId
	const accessCode = req.params.accessCode
	const emailSettings = req.body

	updateEmailSettings(shortId, accessCode, emailSettings)
		.then((response) => res.json(response))
		.catch(error => next(error))
}