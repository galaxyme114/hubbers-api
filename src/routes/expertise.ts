import {

	adminCreateExpertise, adminCreateExpertiseReview,
	adminFetchExpertiseByShortId, adminFetchExpertiseReview, adminFetchExpertiseSingleReview, adminRemoveExpertiseReview,
	adminUpdateExpertise, adminUpdateExpertiseReview,
	createExpertiseByUserId,
	createExpertiseOrder,
	createExpertiseReview, fetchAllExpertise, fetchExpertiseByIds,
	fetchExpertiseByShortId,  fetchExpertiseByTags, fetchExpertiseOrder, fetchExpertiseReview,
	fetchExpertiseSingleReview,  removeExpertise, removeExpertiseReview, updateExpertise, updateExpertiseReview
} from '../controllers/expertise'
import { ExpertiseModel } from '../models/expertise'
import { ExpertiseOrderModel } from '../models/expertiseOrder'
import { filterObject } from '../utils/stringUtils'

import {check} from 'express-validator/check'
import {requestValidator} from '../middlewares/errorHandler'

/**
 * Express route for fetching expertise while sending the parameters forward
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const index = (req, res, next) => {
	const tags: [string] = req.query.tags ? req.query.tags.split(',') : []
	const categoryId: string = req.params.categoryId

	fetchExpertiseByTags(tags, categoryId)
		.then((expertise: ReadonlyArray<ExpertiseModel>) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for fetching expertise as an admin
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminIndex = (req, res, next) => {
	fetchAllExpertise()
		.then((expertise: ReadonlyArray<ExpertiseModel>) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for creating a new expertise order for a given expertise
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const createOrder = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const projectId = req.body.projectId
	const selectedPackageId = req.body.selectedPackageId

	createExpertiseOrder(req.user.id, projectId, expertiseId, selectedPackageId)
		.then(response => {
			res.json(response)
			res.app.emit('expertise:order', response)
		}).catch(error => next(error))
}

/**
 * Express route for fetching an active expertise order
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchOrder = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const userId = req.user.id

	fetchExpertiseOrder(expertiseId, userId)
		.then((expertiseOrder: ExpertiseOrderModel) => res.json(expertiseOrder))
		.catch(error => next(error))
}

/**
 * Express route Admin for fetching a single expertise
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetch = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	// const expertUserId = req.query.isEditable ? req.user.id : null

	adminFetchExpertiseByShortId(expertiseId)
		.then((expertise: ExpertiseModel) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for fetching a single expertise with expertise order if available
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetch = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const expertUserId = req.query.isEditable ? req.user.id : null

	fetchExpertiseByShortId(expertiseId, expertUserId)
		.then((expertise: ExpertiseModel) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for creating an expertise if the user does not already have a draft expertise
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const create = (req, res, next) => {
	const userId = req.user.id

	createExpertiseByUserId(userId)
		.then((expertise: ExpertiseModel) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for creating an expertise if the user does not already have a draft expertise
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminCreate = (req, res, next) => {
	const postData = filterObject(req.body,
		['name', 'slug', 'expert', 'featuredImageUrl', 'gallery', 'tags', 'about', 'category', 'faq', 'packages', 'isDraft'])
	adminCreateExpertise(postData)
		.then((expertise: ExpertiseModel) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for creating an expertise if the user does not already have a draft expertise
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const update = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const updatedExpertise = filterObject(req.body,
		['name', 'slug', 'featuredImageUrl', 'gallery', 'tags', 'about', 'category', 'faq', 'packages', 'isDraft'])

	updateExpertise(expertiseId, updatedExpertise)
		.then((expertise: ExpertiseModel) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express Admin route for creating an expertise
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminUpdateMiddleware = [
	check('name').exists(),
	check('name').not().isEmpty(),
	check('slug').exists(),
	check('slug').not().isEmpty(),
	requestValidator
]
export const adminUpdate = (req, res, next) => {
	console.log('adaad')
	const expertiseId = req.params.expertiseId
	const updatedExpertise = filterObject(req.body,
		['name', 'slug', 'featuredImageUrl', 'tags', 'about', 'category', 'faq', 'packages', 'isDraft',
			'rating', 'gallery', 'briefTemplate', 'expert', 'category'])

	adminUpdateExpertise(expertiseId, updatedExpertise)
		.then((expertise: ExpertiseModel) => {
			
			if (expertise.isDraft === true) { res.app.emit('expertiseApplicationApproved:new', expertise._id) }
			res.json(expertise)
		})
		.catch(error => next(error))
}

/*
*  Express route for remove or delete expertise
* */
export const adminRemoveExpertise = (req, res, next) => {
	const expertiseId = req.params.expertiseId

	removeExpertise(expertiseId)
		.then((expertise: ExpertiseModel) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for fetching multiple expertise
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const indexIds = (req, res, next) => {
	const expertiseIds = req.query.ids

	fetchExpertiseByIds(expertiseIds.split(','))
		.then((expertise: ReadonlyArray<ExpertiseModel>) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for creating an expertise Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const reviewCreate = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const userId = req.user.id
	const expertiseReviewData = filterObject(req.body, ['rating', 'body'])

	createExpertiseReview(expertiseId, expertiseReviewData, userId )
		.then((expertise: ExpertiseModel) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for creating an expertise Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminReviewCreate = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const userId = req.user.id
	const expertiseReviewData = filterObject(req.body, ['rating', 'body'])

	adminCreateExpertiseReview(expertiseId, expertiseReviewData, userId )
		.then((expertise: ExpertiseModel) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for fetch an expertise Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchReviews = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	fetchExpertiseReview(expertiseId)
		.then((expertise: any) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for admin fetch an expertise Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetchReviews = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	adminFetchExpertiseReview(expertiseId)
		.then((expertise: any) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for fetch an expertise Single Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchSingleReviews = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const reviewId = req.params.reviewId

	fetchExpertiseSingleReview(expertiseId, reviewId)
		.then((expertise: any) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for  Admin fetch an expertise Single Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetchSingleReviews = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const reviewId = req.params.reviewId

	adminFetchExpertiseSingleReview(expertiseId, reviewId)
		.then((expertise: any) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for fetch an expertise Update Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const reviewUpdateMiddleware = [
	check('rating').exists(),
	check('rating').not().isEmpty(),
	check('body').exists(),
	check('body').not().isEmpty(),
	requestValidator
]
export const reviewUpdate = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const reviewId = req.params.reviewId
	const updatedExpertise = filterObject(req.body, ['rating', 'body'])

	updateExpertiseReview(expertiseId, reviewId, updatedExpertise)
		.then((expertise: any) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for admin fetch an expertise Update Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminReviewUpdateMiddleware = [
	check('rating').exists(),
	check('rating').not().isEmpty(),
	check('body').exists(),
	check('body').not().isEmpty(),
	requestValidator
]
export const adminReviewUpdate = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const reviewId = req.params.reviewId
	const updatedExpertise = filterObject(req.body, ['rating', 'body'])

	adminUpdateExpertiseReview(expertiseId, reviewId, updatedExpertise)
		.then((expertise: any) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for fetch an expertise remove Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */

export const removeReview = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const reviewId = req.params.reviewId

	removeExpertiseReview(expertiseId, reviewId)
		.then((expertise: any) => res.json(expertise))
		.catch(error => next(error))
}

/**
 * Express route for fetch an expertise remove Review
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminRemoveReview = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const reviewId = req.params.reviewId

	adminRemoveExpertiseReview(expertiseId, reviewId)
		.then((expertise: any) => res.json(expertise))
		.catch(error => next(error))
}
