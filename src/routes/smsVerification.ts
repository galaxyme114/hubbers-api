import { check } from 'express-validator/check'
import { HBE014_FAILED_TO_DELIVER, HBE015_FAILED_TO_VERIFY } from '../constants/errors'
import { requestSMSCode, verifySMSCode } from '../controllers/smsVerification'
import { HubbersBaseError } from '../errors/index'
import { requestValidator } from '../middlewares/errorHandler'

/**
 * Route to make a new request for an SMS code
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const requestMiddleware = [
	check('phoneNumber').not().isEmpty(), requestValidator
]

export const request = (req, res, next) => {
	const phoneNumber = req.body.phoneNumber

	requestSMSCode(phoneNumber)
		.then(result => res.json({ success: true }))
		.catch(() => next(new HubbersBaseError(HBE014_FAILED_TO_DELIVER)))
}

/**
 * Route to make a verify a given sms code
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const verifyMiddleware = [
	check('phoneNumber').not().isEmpty(),
	check('code').not().isEmpty(),
	requestValidator
]

export const verify = (req, res, next) => {
	const phoneNumber = req.body.phoneNumber
	const code = req.body.code

	verifySMSCode(phoneNumber, code)
		.then(result => res.json({ success: true }))
		.catch(() => next(new HubbersBaseError(HBE015_FAILED_TO_VERIFY)))
}