import { userAuthenticator } from '../middlewares/authenticator'

import { HBE003_FAILED_TO_FETCH, HBE004_FAILED_TO_CREATE, HBE006_FAILED_TO_UPDATE } from '../constants/errors'
import {
	adminApproveSingleContestant,
	adminApproveSingleJudge,
	adminDeleteContest,
	adminDeleteContestantApplication,
	adminDeleteJudgeApplication,
	adminUpdateContestFunc,
	contestCreate,
	createParticipateContestantForContest,
	createParticipateJudgeForContest,
	fetchAllContest, fetchContest,
	fetchSingleByShortId,
	getContestLeaderboard,
	updateContestLikes,
	updateContestView
} from '../controllers/contests'
import { HubbersBaseError } from '../errors'

import { ContestModel } from '../models/contest'
import { filterObject } from '../utils/stringUtils'

import { check } from 'express-validator/check'
import { requestValidator } from '../middlewares/errorHandler'

/**
 * Fetch the leaderboard for the contest
 *
 * @param req
 * @param res
 * @param next
 */
export const leaderboard = (req, res, next) => {
	const shortId = req.params.shortId

	getContestLeaderboard(shortId)
		.then((response: ContestModel) => res.json(response))
		.catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Express route for admin Delete contest
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const deleteContest = (req, res, next) => {
	const contestId = req.params.contestId

	adminDeleteContest(contestId)
		.then(contest => res.json(contest))
		.catch((error: any) => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Fetch a single contest for a user
 *
 * @param req
 * @param res
 * @param next
 */
export const fetchByShortId = (req, res, next) => {
	const shortId = req.params.shortId
	const userId = req.user ? req.user._id : ''

	fetchSingleByShortId(shortId, userId)
		.then((response: ContestModel) => res.json(response))
		.catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Fetch all contests for a user
 *
 * @param req
 * @param res
 * @param next
 */
export const fetchAll = (req, res, next) => {
	const userId = req.user ? req.user._id : ''

	fetchAllContest(userId, false)
		.then((contests: ContestModel[]) => res.json(contests))
		.catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Participate as a Judge on a contest
 *
 * @param req
 * @param res
 * @param next
 */
export const contestParticipateJudge = (req, res, next) => {
	const contestId = req.params.contestId
	const userId = req.user._id

	createParticipateJudgeForContest(contestId, userId)
		.then((contest: ContestModel[]) => {
			res.app.emit('judgeApplication:new', {contest, user:req.user})
			res.app.emit('judgeActivity:new', { contest, user: req.user })
			res.json(contest)

		}).catch(error => next(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
}

/*
 *  create participate Contestant for Contest
 * */
export const contestParticipateContestant = (req, res, next) => {
	const contestId = req.params.contestId
	const userId = req.user._id

	createParticipateContestantForContest(contestId, userId)
		.then((contest: ContestModel[]) => {
			res.app.emit('contestantApplication:new', { contest, user: req.user })
			res.app.emit('contestantActivity:new', { contest, user: req.user })
			res.json(contest)
		})
		.catch((error) => {
			next(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
		})
}

/**
 * Express route for liking a single contest
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateContestLikeMiddleware = [
	userAuthenticator,
	check('like').exists(),
	check('like').isBoolean(),
	requestValidator
]
export const like = (req, res, next) => {
	const contestId = req.params.contestId
	const liked = req.body.like
	const userId = req.user.id

	updateContestLikes(userId, contestId, liked)
		.then((constest) => {
			res.app.emit('like:new', {constest, user: req.user})
			res.json(constest)
		})
		.catch(error => next(HBE006_FAILED_TO_UPDATE, error))
}

/**
 * Express route for Increment the views of a contest
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateContestViewMiddleware = [
	check('view').exists(),
	check('view').isBoolean(),
	requestValidator
]
export const view = (req, res, next) => {
	const contestId = req.params.contestId

	updateContestView(contestId)
		.then((response) => res.json(response))
		.catch(error => next(HBE006_FAILED_TO_UPDATE, error))
}

/**
 * Express route for admin create contest
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */

export const adminCreateContestMiddleware = [
	check('name').exists(),
	check('name').not().isEmpty(),
	requestValidator
]

export const adminCreate = (req, res, next) => {
	const newContestData = filterObject(req.body,
		['name', 'slug', 'featuredImageUrl', 'description', 'market', 'rules', 'startTime',
			'duration', 'geography', 'budget', 'views', 'prizes', 'likes', 'allowJudgeSignup',
			'', 'isDraft', 'contestants', 'judges', 'entries', 'criteria'])

	contestCreate(newContestData)
		.then(contest => res.json(contest))
		.catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Express route for admin Update contest
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminUpdateContestMiddleware = [
	check('name').exists(),
	check('name').not().isEmpty(),
	check('slug').exists(),
	check('slug').not().isEmpty(),
	check('featuredImageUrl').exists(),
	check('featuredImageUrl').not().isEmpty(),
	check('description').exists(),
	check('description').not().isEmpty(),
	check('market').exists(),
	check('market').not().isEmpty(),
	check('rules').exists(),
	check('rules').not().isEmpty(),
	check('prizes').exists(),
	check('prizes').not().isEmpty(),
	requestValidator
]

export const updateContest = (req, res, next) => {
	const contestId = req.params.contestId
	const newContestData = filterObject(req.body,
		['name', 'slug', 'featuredImageUrl', 'description', 'market', 'rules', 'startTime',
			'duration', 'geography', 'budget', 'views', 'productCategory', 'innovationCategory',
			'prizes', 'likes', 'allowJudgeSignup', 'allowContestantSignup', 'isDraft', 'criteria', 'contestants', 'judges',
			'entries', 'criteria'])

	adminUpdateContestFunc(newContestData, contestId)
		.then(contest => res.json(contest))
		.catch((error: any) => {
			next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
		})
}

/**
 * Admin fetch by id
 *
 * @param req
 * @param res
 * @param next
 */
export const adminFetch = (req, res, next) => {
	const contestId = req.params.contestId

	fetchContest(contestId)
		.then(contest => res.json(contest))
		.catch((error) => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Fetch all contests for an admin
 *
 * @param req
 * @param res
 * @param next
 */
export const adminFetchAll = (req, res, next) => {
	fetchAllContest('', true)
		.then((contests: ContestModel[]) => res.json(contests))
		.catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Approve judge participation from
 */
export const adminApproveJudgeMiddleware = []
export const adminApproveJudge = (req, res, next) => {
	const contestId = req.params.contestId
	const judgeId = req.params.judgeId

	adminApproveSingleJudge(contestId, judgeId, true)
		.then((response: ContestModel) => {
			res.json(response)
			res.app.emit('judgeApplicationApproved:new', response)
		}).catch((error) => next(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Reject judge participation from admin
 */
export const adminRejectJudgeMiddleware = []
export const adminRejectJudge = (req, res, next) => {
	const contestId = req.params.contestId
	const judgeId = req.params.judgeId

	adminApproveSingleJudge(contestId, judgeId, false)
		.then((response: ContestModel) => res.json(response))
		.catch((error) => next(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Approve contestant participation from admin
 */
export const adminApproveContestantMiddleware = []
export const adminApproveContestant = (req, res, next) => {
	const contestId = req.params.contestId
	const contestantId = req.params.contestantId

	adminApproveSingleContestant(contestId, contestantId, true)
		.then((response: ContestModel) => {
			res.json(response)
			res.app.emit('contestantApplicationApproved:new', response)
		}).catch(error => next(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Reject contestant participation from admin
 */
export const adminRejectContestantMiddleware = []
export const adminRejectContestant = (req, res, next) => {
	const contestId = req.params.contestId
	const contestantId = req.params.contestantId

	adminApproveSingleContestant(contestId, contestantId, false)
		.then((response: ContestModel) => res.json(response))
		.catch(error => next(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Express route for admin Delete contestant Application
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const deleteContestantApplication = (req, res, next) => {
	const contestId = req.params.contestId
	const contestantApplicationId = req.params.contestantId

	adminDeleteContestantApplication(contestId, contestantApplicationId)
		.then(contest => res.json(contest))
		.catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Express route for admin Delete judge Application
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const deleteJudgeApplication = (req, res, next) => {
	const contestId = req.params.contestId
	const judgeApplicationId = req.params.judgeId

	adminDeleteJudgeApplication(contestId, judgeApplicationId)
		.then(contest => res.json(contest))
		.catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}