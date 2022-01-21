import {
	fetchKnownAssociatesById,
	fetchPublicProfileById,
	fetchUserProfileById, fetchPublicById, updateUserProfile,fetchFullPublicById
} from '../controllers/profile'
import { filterObject } from '../utils/stringUtils'

/**
 * Express route for fetching a user's self profile
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchSelf = (req, res, next) => {
	fetchUserProfileById(req.user._id)
		.then(profile => res.json(profile))
		.catch(error => { next(error) })
}

/**
 * Express public route for fetching user basic info
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchByPublic = (req, res, next) => {
	const userId = req.params.id;
	fetchPublicById(userId)
		.then(profile => res.json(profile))
		.catch(error => { next(error) })
}


/**
 * Express public route for fetching user full info
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchFullByPublic = (req, res, next) => {
	const userId = req.params.id;
	const fullName = req.params.fullName;
	fetchFullPublicById(userId)
		.then(profile => res.json(profile))
		.catch(error => { next(error) })
}


/**
 * Express route for fetching a user's known associates while searching
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchKnownAssociates = (req, res, next) => {
	const searchQuery = req.query.q

	fetchKnownAssociatesById(req.query.id, searchQuery)
		.then(knownAssociates => res.json(knownAssociates))
		.catch(error => { next(error) })
}

/**
 * Express route for fetching a user's profile by id
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetch = (req, res, next) => {
	const userId = req.params.id

	fetchPublicProfileById(userId)
		.then(profile => res.json(profile))
		.catch(error => { next(error) })
}

/**
 * Express route for updating a user's self profile
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateSelf = (req, res, next) => {
	const updatedProfile = filterObject(req.body,
		['name', 'lastName', 'headline', 'industry', 'bio', 'thumbnailImageUrl',
			'productCategories', 'innovationCategories', 'skills', 'expertiseCategories'])
	const userId = req.user._id
	
	updateUserProfile(userId, updatedProfile)
		.then(profile => res.json(profile))
		.catch(error => { next(error) })
}