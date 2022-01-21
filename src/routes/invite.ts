import { check } from 'express-validator/check'
import {
	createContestantInvitation,
	createExpertInvitation, createExpertiseInvitation, createJudgeInvitation, createObserverInvitation,
	fetchContestantInvitation,
	fetchExpertInvitation, fetchJudgeInvitation,
	fetchObserverInvitation
} from '../controllers/invite'
import { HubbersBaseError } from '../errors/index'
import { requestValidator } from '../middlewares/errorHandler'

/**
 * Validations & Middleware
 */
export const fetchInviteMiddleware = [
	check('code').not().isEmpty(), requestValidator
]

export const inviteExpertMiddleware = [
	check('name').not().isEmpty(),
	check('email').not().isEmpty(),
	check('tags').not().isEmpty(),
	requestValidator
]

export const inviteObserverMiddleware = [
	check('name').not().isEmpty(),
	check('email').not().isEmpty(),
	requestValidator
]

export const inviteContestantMiddleware = [
	check('name').not().isEmpty(),
	check('email').not().isEmpty(),
	check('contestId').not().isEmpty(), check('contestId').isNumeric(),
	requestValidator
]

export const inviteJudgeMiddleware = [
	check('name').not().isEmpty(),
	check('email').not().isEmpty(),
	check('contestId').not().isEmpty(), check('contestId').isNumeric(),
	requestValidator
]

export const inviteExpertiseMiddleware = [
	check('name').not().isEmpty(), check('tags').not().isEmpty(),
	requestValidator
]

/**
 * Express route for verifying the invitation token
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchExpertInvite = (req, res, next) => {
	const invitationCode = req.query.code

	fetchExpertInvitation(invitationCode)
		.then(response => res.json(response))
		.catch((error: HubbersBaseError) => next(error))
}

/**
 * Express route for verifying the invitation token
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchObserverInvite = (req, res, next) => {
	const invitationCode = req.query.code

	fetchObserverInvitation(invitationCode)
		.then(response => res.json(response))
		.catch((error: HubbersBaseError) => next(error))
}

/**
 * Express route for verifying the invitation token
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchContestantInvite = (req, res, next) => {
	const invitationCode = req.query.code

	fetchContestantInvitation(invitationCode)
		.then(response => res.json(response))
		.catch((error: HubbersBaseError) => next(error))
}

/**
 * Express route for verifying the invitation token
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchJudgeInvite = (req, res, next) => {
	const invitationCode = req.query.code

	fetchJudgeInvitation(invitationCode)
		.then(response => res.json(response))
		.catch((error: HubbersBaseError) => next(error))
}

/**
 * Express route for creating an invitation
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const inviteExpert = (req, res, next) => {
	createExpertInvitation(req.body)
		.then(response => {
			res.json(response)
			res.app.emit('invite:expert', response)
		}).catch(error => next(error))
}

/**
 * Express route for creating an invitation
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const inviteObserver = (req, res, next) => {
	createObserverInvitation(req.body)
		.then(response => {
			res.json(response)
			res.app.emit('invite:observer', response)
		}).catch(error => next(error))
}

/**
 * Express route for creating an invitation
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const inviteContestant = (req, res, next) => {
	createContestantInvitation(req.body)
		.then(response => {
			res.json(response)
			res.app.emit('invite:contestant', response)
		}).catch(error => next(error))
}

/**
 * Express route for creating an invitation
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const inviteJudge = (req, res, next) => {
	createJudgeInvitation(req.body)
		.then(response => {
			res.json(response)
			res.app.emit('invite:judge', response)
		}).catch(error => next(error))
}

/**
 * Express route for creating an invitation
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const inviteExpertise = (req, res) => {
	createExpertiseInvitation(req.body)
		.then(response => {
			res.json(response)
			res.app.emit('invite:expertise', response)
		}).catch(error => res.json(error.message).status(400))
}