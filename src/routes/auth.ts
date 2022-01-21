import { check } from 'express-validator/check'
import { HBE012_FAILED_TO_REGISTER } from '../constants/errors'
import { authenticateUser, performLinkedinLogin } from '../controllers/auth'
import { parsePhoneNumber, verifySMSConfirmation } from '../controllers/sms'
import {
	loginUser,
	loginUserPhone,
	recoverUserPassword,
	registerUser,
	requestUserPasswordReset
} from '../controllers/user'
import { HubbersBaseError } from '../errors'
import { NotifyResetPassword } from '../events/resetPassword'
import { JWTToken } from '../interfaces/user'
import { requestValidator } from '../middlewares/errorHandler'

/**
 * Express route for authenticating a user token
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const authenticate = (req, res, next) => {
	authenticateUser(req.user)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for logging in a user
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const loginMiddleware = [
	check('email').not().isEmpty(),
	check('password').not().isEmpty(),
	requestValidator
]
export const login = (req, res, next) => {
	const email = req.body.email.toLowerCase()
	const password = req.body.password

	loginUser(email, password)
		.then((jwtToken: JWTToken) => res.json(jwtToken))
		.catch((error: any) => next(error))
}

/**
 * Express route for logging in a user
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const loginPhoneMiddleware = [
	check('phoneNumberCountryCode').not().isEmpty(),
	check('phoneNumber').not().isEmpty(),
	check('password').not().isEmpty(),
	requestValidator
]
export const loginPhone = (req, res, next) => {
	const phoneNumberCountryCode = req.body.phoneNumberCountryCode
	const phoneNumber = req.body.phoneNumber
	const password = req.body.password

	loginUserPhone(phoneNumberCountryCode, phoneNumber, password)
		.then((jwtToken: JWTToken) => res.json(jwtToken))
		.catch((error: any) => next(error))
}

/**
 * Express route for registering a user
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const registerMiddleware = [
	check('email').not().isEmpty(),
	check('password').not().isEmpty(),
	// check('phoneNumber').not().isEmpty(),
	requestValidator
]

export const register = (req, res, next) => {
	const email = req.body.email.toLowerCase()
	const name = req.body.name || email.split('@')[0]
	const password = req.body.password
	const phoneNumber = req.body.phoneNumber

	const userData = { email, name, password, phoneNumber } as any

	if (req.body.lastName) {
		userData.lastName = req.body.lastName
	}

	registerUser(userData)
		.then((jwtToken: JWTToken) => res.json(jwtToken))
		.catch((error) => next(error))
}

/**
 * Express route for registering a user
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const registerPhoneMiddleware = [
	check('phoneNumber').not().isEmpty(),
	check('smsCode').not().isEmpty(),
	check('password').not().isEmpty(),
	requestValidator
]

export const registerPhone = (req, res, next) => {
	const phoneNumber = req.body.phoneNumber
	const smsCode = req.body.smsCode
	const name = req.body.name
	const password = req.body.password

	const userData = { phoneNumber, name, password } as any

	if (req.body.lastName) {
		userData.lastName = req.body.lastName
	}

	const parsedPhoneNumber = parsePhoneNumber(phoneNumber)

	verifySMSConfirmation(parsedPhoneNumber.phoneNumber, parsedPhoneNumber.phoneNumberCountryCode, smsCode)
		.then(() => registerUser(userData))
		.then((jwtToken: JWTToken) => res.json(jwtToken))
		.catch((error) => next(error))
}

/**
 * Express route for requesting a password reset
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const forgotMiddleware = [
	check('email').not().isEmpty(),
	requestValidator
]

export const forgot = (req, res, next) => {
	const email = req.body.email

	requestUserPasswordReset(email)
		.then(response => {
			res.json(response)
			res.app.emit('notify:reset-password', {
				name: '', email, token: response.token,
				link: process.env.WEB_URL + `/reset-password?token=${response.token}&email=${email}`
			})
		}).catch((error) => next(error))
}

/**
 * Express route for recovering a password
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const recoverMiddleware = [
	check('token').not().isEmpty(),
	check('password').not().isEmpty(),
	requestValidator
]

export const recover = (req, res, next) => {
	const password = req.body.password
	const token = req.body.token

	recoverUserPassword(token, password)
		.then(response => res.json(response))
		.catch((error) => next(error))
}

/**
 * Express route for recovering a password
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
// export const resetPhoneMiddleware = [
// 	check('phoneNumber').not().isEmpty(),
// 	check('smsCode').not().isEmpty(),
// 	check('password').not().isEmpty(),
// 	requestValidator
// ]
//
// export const resetPhone = (req, res, next) => {
// 	const phoneNumber = req.body.phoneNumber
// 	const smsCode = req.body.smsCode
// 	const password = req.body.password
//
// 	const parsedPhoneNumber = parsePhoneNumber(phoneNumber)
//
// 	verifySMSConfirmation(parsedPhoneNumber.phoneNumber, parsedPhoneNumber.phoneNumberCountryCode, smsCode)
// 		.then(() => resetUserPassword(phoneNumber, password))
// 		.then(response => res.json(response))
// 		.catch((error) => next(error))
// }

/**
 * Express route for logging in and registering with linkedin
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const linkedin = (req, res, next) => {
	const code = req.query.code

	performLinkedinLogin(code)
		.then((token: JWTToken) => {
			// res.json({ token: token.token})
			console.log('yyyyyyyyyyy', process.env.WEB_URL)
			res.render('linkedin-login.html', { token: token.token, origin: process.env.WEB_URL })
		}).catch((error) => { next(new HubbersBaseError(HBE012_FAILED_TO_REGISTER, error)) })
}	