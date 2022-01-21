import { check } from 'express-validator/check'
import {
	createBusinessNeed, fetchBusinessNeedByShortId, fetchBusinessNeedsByTags,
	removeBusinessNeed
} from '../controllers/businessNeeds'
import { requestValidator } from '../middlewares/errorHandler'
import { BusinessNeedsModel } from '../models/businessNeeds'
import { filterObject } from '../utils/stringUtils'

/**
 * Express route for fetching business needs
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const index = (req, res, next) => {
	const tags: [string] = req.query.tags ? req.query.tags.split(',') : []
	const categoryId: string = req.params.categoryId

	fetchBusinessNeedsByTags(tags, categoryId)
		.then((businessNeeds: ReadonlyArray<BusinessNeedsModel>) => res.json(businessNeeds))
		.catch(error => next(error))
}

/**
 * Express route for fetching a single business need
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetch = (req, res, next) => {
	const businessNeedId = req.params.id

	fetchBusinessNeedByShortId(businessNeedId)
		.then((businessNeed: BusinessNeedsModel) => res.json(businessNeed))
		.catch(error => next(error))
}

/**
 * Express route for creating a business need
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const createMiddleware = [
	check('projectId').not().isEmpty(),
	check('description').not().isEmpty(),
	check('tags').not().isEmpty(),
	check('categoryId').not().isEmpty(),
	check('budgetMin').not().isEmpty(),
	check('budgetMax').not().isEmpty(),
	requestValidator
]
export const create = (req, res, next) => {
	const userId = req.user._id

	const body = filterObject(req.body,
		['projectId', 'description', 'tags', 'categoryId', 'budgetMin', 'budgetMax', 'geography'])

	createBusinessNeed(userId, body)
		.then((businessNeed: BusinessNeedsModel) => res.json(businessNeed))
		.catch(error => next(error))
}

export const remove = (req, res, next) => {
	const businessNeedId = req.params.id
	const userId = req.user.id

	removeBusinessNeed(businessNeedId, userId)
		.then((businessNeed: BusinessNeedsModel) => res.json(businessNeed))
		.catch(error => next(error))
}

// /**
//  * Express route for creating an expertise if the user does not already have a draft expertise
//  *
//  * @param req Request from Express
//  * @param res Response from Express
//  * @param next
//  */
// export const update = (req, res, next) => {
// 	const expertiseId = req.params.expertiseId
// 	const updatedExpertise = filterObject(req.body,
// 		['name', 'slug', 'featuredImageUrl', 'gallery', 'tags', 'about', 'category', 'faq', 'packages', 'isDraft'])
//
// 	updateExpertise(expertiseId, updatedExpertise)
// 		.then((expertise: ExpertiseModel) => res.json(expertise))
// 		.catch(error => next(error))
// }