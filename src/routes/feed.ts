import { adminFetchUserFeed, fetchUserFeed } from '../controllers/feed'

/**
 * Express route for fetching a users feed
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */

export const fetch = (req, res, next) => {
	fetchUserFeed(req.user._id)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

export const adminFetch = (req, res, next) => {
	adminFetchUserFeed(req.user._id)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}