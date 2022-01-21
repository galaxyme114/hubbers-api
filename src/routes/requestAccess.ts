import { check } from 'express-validator/check'
import { HBET001_OBSERVER_REQUEST_ADMIN } from '../constants/emailTemplate'
import { HBE012_FAILED_TO_REGISTER } from '../constants/errors'
import { HubbersBaseError } from '../errors/index'
import { requestValidator } from '../middlewares/errorHandler'
import { EmailBuilder } from '../utils/emailClient'

/**
 * Validations & Middleware
 */
export const observerMiddleware = [
	check('name').not().isEmpty(),
	check('email').not().isEmpty(), check('email').isEmail(),
	requestValidator
]

/**
 * Express route for requesting access for observer
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const observer = (req, res, next) => {
	const name = req.body.name
	const email = req.body.email

	const eb = new EmailBuilder(HBET001_OBSERVER_REQUEST_ADMIN, process.env.ADMINS.split(','), { name, email })
	eb.send()
		.then(() => res.json({ success: true }))
		.catch((error) => {
			console.log('error', error)
			next(new HubbersBaseError(HBE012_FAILED_TO_REGISTER))
		})
}