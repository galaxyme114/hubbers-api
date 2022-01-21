import { check } from 'express-validator/check'
import { userAuthenticator } from '../middlewares/authenticator'

import {HBE003_FAILED_TO_FETCH,
	HBE004_FAILED_TO_CREATE,
	HBE006_FAILED_TO_UPDATE
	} from '../constants/errors'
import {HubbersBaseError} from '../errors'

import {
	adminFetchAllRating,
	adminFetchSingleContestEntry,
	adminRemoveEntry,
	adminRemoveRating,
	adminUpdateAttachments,
	adminUpdateContestEntry,
	fetchAllEntries,
	fetchAllRating,
	fetchContestContestantEntry,
	fetchContestJudgeEntry,
	fetchEntriesByContestantId,
	fetchEntriesByJudgeId,
	fetchSingleContestEntry,
	putEntryAttachments,
	putEntryRating,
	updateAttachments,
	updateContestEntry,
	updateRating

} from '../controllers/entry'
import { entryCreate } from '../controllers/entry'
import { filterObject } from '../utils/stringUtils'

import { requestValidator } from '../middlewares/errorHandler'
import {ContestModel} from '../models/contest'
import {EntryModel} from '../models/entry'

/**
 * Express route for create entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const create = (req, res, next) => {
	const contestId = req.params.contestId
	const contestantId = req.user._id

	const newEntryData = filterObject(req.body,
		['title', 'descriptionDesign', 'descriptionFunctionality', 'descriptionUsability',
			'descriptionMarketPotential', 'attachments'])

	entryCreate(newEntryData, contestId, contestantId)
		.then(response => {
			res.json(response)
			// @TODO: Notify judges once an entry is created
		}).catch((error) => next(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
}

/**
 * Express route for fetch entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchContestEntry = (req, res, next) => {
	const entryId = req.params.entryId
	const userId = req.user._id

	fetchSingleContestEntry(entryId, userId)
		.then(entry => res.json(entry))
		.catch((error) => next(new HubbersBaseError(error)))
}

/**
 * Express route for fetch contestant entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const contestContestantEntry = (req, res, next) => {
	const contestId = req.params.contestId
	const contestantId = req.user._id

	fetchContestContestantEntry(contestId, contestantId)
		.then(entry => res.json(entry))
		.catch((error) => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Express route for fetch judge entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const contestEntryJudge = (req, res, next) => {
	const contestId = req.params.contestId
	const judgeId = req.user._id

	fetchContestJudgeEntry(contestId, judgeId)
		.then(entry => res.json(entry))
		.catch((error) => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Express route for update entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateEntry = (req, res, next) => {
	const entryId = req.params.entryId
	const contestantId = req.user._id
	const newEntryData = filterObject(req.body, ['title', 'descriptionDesign', 'descriptionFunctionality',
		'descriptionUsability', 'descriptionMarketPotential', 'attachments', 'isDraft'])

	updateContestEntry(entryId, contestantId, newEntryData)
		.then((entry: EntryModel) => {
			// Notify the judges when a new entry is being submitted
			if (entry.isDraft) { 
				console.log('isDraft')
				res.app.emit('entry:new', entry.contest as string) 
				res.app.emit('entryActivity:new',{contest: entry.contest, user: req.user})
			}
			res.json(entry)
		}).catch(error => next(new HubbersBaseError(error)))
}

/**
 * Express route for adding entry attachments
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const entryAttachments = (req, res, next) => {
	const entryId = req.params.entryId
	const attachments = req.body.attachments

	attachments.map(attach => filterObject(attach, ['title', 'caption', 'previewUrl', 'fileType']))

	putEntryAttachments(entryId, attachments)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError(error)))
}

/**
 * Express route for update entry attachments
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateEntryAttachments = (req, res, next) => {

	const attachmentId = req.params.attachmentId
	const entryId = req.params.entryId
	const contestantId = req.user._id
	const updateAttachmentData = filterObject(req.body,
		['title', 'caption', 'previewUrl', 'fileType'])

	updateAttachments(contestantId, attachmentId, entryId, updateAttachmentData)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError( HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Express route for put entries rating
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const entryRatingMiddleware = [
	check('design').exists(),
	check('design').not().isEmpty(),
	check('functionality').exists(),
	check('functionality').not().isEmpty(),
	check('usability').exists(),
	check('usability').not().isEmpty(),
	check('marketPotential').exists(),
	check('marketPotential').not().isEmpty(),
	requestValidator, userAuthenticator
]
export const entryRating = (req, res, next) => {
	const entryId = req.params.entryId
	const judgeId = req.user._id
	const newRating = filterObject(req.body,
		['design', 'designComment', 'functionality', 'functionalityComment',
			'usability', 'usabilityComment', 'marketPotential', 'marketPotentialComment', 'isSeen', 'conversation'])

	putEntryRating(judgeId, entryId, newRating)
		.then((entry: EntryModel) => {
			res.json(entry)
			
			// Update the leaderboard and send notification to the contestant when an entry is reviewed
			res.app.emit('rating:new', entry.contest)
			// res.app.emit('review:new', entry, judgeId) // @TODO: Notify contestant individually
		}).catch(error => next(new HubbersBaseError(error)))
}

/**
 * Express User route for fetch entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchRatings = (req, res, next) => {
	const entryId = req.params.entryId
	fetchAllRating(entryId)
		.then(entry => res.json(entry))
		.catch((error) => {
			next(new HubbersBaseError( error))
		})
}

/**
 * Express Admin route for fetch entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminfetchAllRating = (req, res, next) => {
	const entryId = req.params.entryId
	fetchAllRating(entryId)
		.then(entry => res.json(entry))
		.catch((error) => {
			next(new HubbersBaseError( error))
		})
}
/**
 * Express Admin route for fetch entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetchRating = (req, res, next) => {
	const entryId = req.params.entryId
	const ratingId = req.params.ratingId

	adminFetchAllRating(entryId, ratingId)
		.then(entry => res.json(entry))
		.catch((error) => {
			next(new HubbersBaseError( error))
		})
}

/**
 * Express route for update rating
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateEntryRating = (req, res, next) => {
	const ratingId = req.params.ratingId
	const entryId = req.params.entryId
	const judgeId = req.user._id
	const updateRatingData = filterObject(req.body,
		['design', 'designComment', 'functionality', 'functionalityComment',
			'usability', 'usabilityComment', 'marketPotential', 'marketPotentialComment', 'isSeen', 'conversation'])

	updateRating(judgeId, ratingId, entryId, updateRatingData)
		.then(entry => {
			res.json(entry)
			
			// Update the leaderboard and send notification to the contestant when an entry is reviewed
			res.app.emit('rating:new', entry.contest as string)
		}).catch(error => next(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Express admin route for listing all entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminIndex = (req, res, next) => {
	const contestId = req.params.contestId
	
	fetchAllEntries(contestId)
		.then(response => res.json(response))
		.catch((error: any) => next(error))
}

/**
 * Express admin route for single entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetch = (req, res, next) => {
	const contestId = req.params.contestId
	const contestContestantId = req.params.contestantId

	fetchEntriesByContestantId(contestId, contestContestantId)
		.then(response => res.json(response))
		.catch((error: any) => next(HBE003_FAILED_TO_FETCH, error))
}

/**
 * Express admin route for single entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetchJudge = (req, res, next) => {
	const contestId = req.params.contestId
	const contestJudgeId = req.params.judgeId

	fetchEntriesByJudgeId(contestId, contestJudgeId)
		.then(response => res.json(response))
		.catch((error: any) => next(HBE003_FAILED_TO_FETCH, error))
}

/**
 * Express admin route for create entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminCreateMiddleware = [
	check('contestantId').exists(),
	check('contestantId').not().isEmpty(),
	check('title').exists(),
	check('title').not().isEmpty(),
	check('descriptionDesign').exists(),
	check('descriptionDesign').not().isEmpty(),
	check('descriptionFunctionality').exists(),
	check('descriptionFunctionality').not().isEmpty(),
	check('descriptionUsability').exists(),
	check('descriptionUsability').not().isEmpty(),
	check('descriptionMarketPotential').exists(),
	check('descriptionMarketPotential').not().isEmpty(),
	requestValidator
]

export const adminCreate = (req, res, next) => {
	const contestId = req.params.contestId
	const contestantId = req.body.contestantId

	const newEntryData = filterObject(req.body,
		['title', 'descriptionDesign', 'descriptionFunctionality', 'descriptionUsability',
			'descriptionMarketPotential', 'attachments', 'isDraft'
		])

	entryCreate(newEntryData, contestId, contestantId)
		.then(response => {
			res.json(response)
			// @TODO: Notify judges once an entry is created
			// res.app.emit('entry:new', response)
		}).catch((error) => next(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
}

/**
 * Express admin route for fetch entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetchEntry = (req, res, next) => {
	const entryId = req.params.entryId
	
	adminFetchSingleContestEntry(entryId)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError( error)))
}

/**
 * Express route for admin update entry
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminUpdateEntryMiddleware = [
	check('title').exists(),
	check('title').not().isEmpty(),
	check('descriptionDesign').exists(),
	check('descriptionDesign').not().isEmpty(),
	check('descriptionFunctionality').exists(),
	check('descriptionFunctionality').not().isEmpty(),
	check('descriptionUsability').exists(),
	check('descriptionUsability').not().isEmpty(),
	check('descriptionMarketPotential').exists(),
	check('descriptionMarketPotential').not().isEmpty(),
	requestValidator
]
export const adminUpdateEntry = (req, res, next) => {
	const entryId = req.params.entryId
	const newEntryData = filterObject(req.body,
		['title', 'descriptionDesign', 'descriptionFunctionality', 'descriptionUsability',
			'descriptionMarketPotential', 'attachments', 'isDraft'])
	
	adminUpdateContestEntry(entryId, newEntryData)
		.then((entry: EntryModel) => {
			res.json(entry)
			// Update the leaderboard and send notification to the contestant when an entry is reviewed
			res.app.emit('rating:new', entry.contest as string)
		}).catch((error) => next(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Express ADMIN route for put entry attachments
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminEntryAttachmentsMiddleware = [
	check('title').exists(),
	check('title').not().isEmpty(),
	check('caption').exists(),
	check('caption').not().isEmpty(),
	check('previewUrl').exists(),
	check('previewUrl').not().isEmpty(),
	requestValidator
]
export const adminEntryAttachments = (req, res, next) => {

	const entryId = req.params.entryId
	const attachments = req.body.attachments

	attachments.map(attach => filterObject(attach, ['title', 'caption', 'previewUrl', 'fileType']))
	putEntryAttachments(entryId, attachments)
		.then(entry => res.json(entry))
		.catch((error) => {
			next(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
		})
}

/**
 * Express ADMIN route for update entry attachments
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminUpdateEntryAttachmentsMiddleware = [
	check('title').exists(),
	check('title').not().isEmpty(),
	check('caption').exists(),
	check('caption').not().isEmpty(),
	check('previewUrl').exists(),
	check('previewUrl').not().isEmpty(),
	requestValidator
]

export const adminUpdateEntryAttachments = (req, res, next) => {

	const attachmentId = req.params.attachmentId
	const entryId = req.params.entryId
	const updateAttachmentData = filterObject(req.body,
		['title', 'caption', 'previewUrl', 'fileType'])

	adminUpdateAttachments(attachmentId, entryId, updateAttachmentData)
		.then(entry => res.json(entry))
		.catch((error) => {
			next(new HubbersBaseError( HBE006_FAILED_TO_UPDATE, error))
		})
}

/**
 * Express ADMIN route for put entries rating
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminEntryRatingMiddleware = [
	check('design').exists(),
	check('design').not().isEmpty(),
	check('functionality').exists(),
	check('functionality').not().isEmpty(),
	check('usability').exists(),
	check('usability').not().isEmpty(),
	check('marketPotential').exists(),
	check('marketPotential').not().isEmpty(),
	requestValidator
]
export const adminEntryRating = (req, res, next) => {

	const entryId = req.params.entryId
	const judgeId = req.user._id
	const newRating = filterObject(req.body,
		['design', 'designComment', 'functionality', 'functionalityComment',
			'usability', 'usabilityComment', 'marketPotential', 'marketPotentialComment', 'isSeen', 'conversation'])

	putEntryRating(judgeId, entryId, newRating)
		.then(entry => {
			res.json(entry)
			// res.app.emit('review:new', entry)
		})
		.catch((error) => {
			next(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
		})
}

/**
 * Express ADMIN route for update rating
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminUpdateEntryRatingMiddleware = [
	check('design').exists(),
	check('design').not().isEmpty(),
	check('functionality').exists(),
	check('functionality').not().isEmpty(),
	check('usability').exists(),
	check('usability').not().isEmpty(),
	check('marketPotential').exists(),
	check('marketPotential').not().isEmpty(),
	requestValidator
]

export const adminUpdateEntryRating = (req, res, next) => {

	const ratingId = req.params.ratingId
	const entryId = req.params.entryId
	const judgeId = req.user._id
	const updateRatingData = filterObject(req.body,
		['design', 'designComment', 'functionality', 'functionalityComment',
			'usability', 'usabilityComment', 'marketPotential', 'marketPotentialComment', 'isSeen', 'conversation'])

	updateRating(judgeId, ratingId, entryId, updateRatingData)
		.then(entry => res.json(entry))
		.catch((error) => {
			next(new HubbersBaseError( HBE006_FAILED_TO_UPDATE, error))
		})
}

/*
*  Express route for remove or delete entry Rating
* */
export const adminRemoveEntryRating = (req, res, next) => {
	const entryId = req.params.entryId
	const ratingId = req.params.ratingId

	adminRemoveRating(entryId, ratingId)
		.then((rating: any) => res.json(rating))
		.catch(error => next(error))
}

/*
*  Express route for remove or delete entry
* */
export const adminRemoveContestEntry = (req, res, next) => {
	const entryId = req.params.entryId

	adminRemoveEntry(entryId)
		.then((enrty: ContestModel) => res.json(enrty))
		.catch(error => next(error))
}