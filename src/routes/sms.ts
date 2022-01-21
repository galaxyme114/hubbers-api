import { check } from 'express-validator/check'
import { parsePhoneNumber, smsRequestCode, smsVerifyCode } from '../controllers/sms'
import { requestValidator } from '../middlewares/errorHandler'

/**
 * Express route for requesting an SMS verification code
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const requestMiddleware = [
	check('phoneNumber').not().isEmpty(),
	requestValidator
]
export const request = (req, res, next) => {
	const phoneNumber = req.body.phoneNumber
	const parsedPhoneNumber = parsePhoneNumber(phoneNumber)
	
	smsRequestCode(parsedPhoneNumber.phoneNumber, parsedPhoneNumber.phoneNumberCountryCode)
		.then(response => res.json(response))
		.catch((error: any) => next(error))
}

/**
 * Express route for requesting an SMS verification code
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const verifyMiddleware = [
	check('phoneNumberCountryCode').not().isEmpty(),
	check('phoneNumber').not().isEmpty(),
	check('smsCode').not().isEmpty(),
	requestValidator
]
export const verify = (req, res, next) => {
	const phoneNumber = req.body.phoneNumber
	const phoneNumberCountryCode = req.body.phoneNumberCountryCode
	const smsCode = req.body.smsCode
	
	smsVerifyCode(phoneNumber, phoneNumberCountryCode, smsCode)
		.then(response => res.json(response))
		.catch((error: any) => next(error))
}
