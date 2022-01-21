import { check } from 'express-validator/check'
import { HBET001_OBSERVER_REQUEST_ADMIN } from '../constants/emailTemplate'
import { HBE012_FAILED_TO_REGISTER } from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { requestValidator } from '../middlewares/errorHandler'
import { EmailBuilder } from '../utils/emailClient'

/**
 * Validations & Middleware
 */
export const contestSuggestionMiddleware = [
	check('name').not().isEmpty(),
	check('email').not().isEmpty(),
	check('email').isEmail(),
	check('company').not().isEmpty(),
	check('position').not().isEmpty(),
	check('competitionTitle').not().isEmpty(),
	check('competitionIndustry').not().isEmpty(),
	check('competitionDescription').not().isEmpty(),
	requestValidator
]

/**
 * Express route for submitting a user feedback for contest suggestion
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const contestSuggestion = (req, res, next) => {
	const name = req.body.name
	const email = req.body.email
	const company = req.body.company
	const position = req.body.position
	const competitionTitle = req.body.competitionTitle
	const competitionIndustry = req.body.competitionIndustry
	const competitionDescription = req.body.competitionDescription
	
	const eb = new EmailBuilder(HBET001_OBSERVER_REQUEST_ADMIN, process.env.ADMINS.split(','),
		{ name, email, company, position, competitionTitle, competitionIndustry, competitionDescription })
	eb.send()
		.then(() => res.json({ success: true }))
		.catch((error) => {
			console.log('error', error)
			next(new HubbersBaseError(HBE012_FAILED_TO_REGISTER))
		})
}