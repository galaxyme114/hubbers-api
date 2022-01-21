import { getUserToken, userStoreApn } from '../controllers/apn'

/**
 * Express route for fetching a user's self profile
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const storeApn = (req, res, next) => {
	const token = req.body.token
	const type = 'ios'
	
	userStoreApn(req.user._id, token, type)
		.then((appToken: string) => res.json(appToken))
		.catch(error => { next(error) })
}

export const sendApn = (req, res, next) => {
	getUserToken(req.user._id).then(response => {
		res.json(response)
		res.app.emit('sendApn', response)
	}).catch(error => next(error))
}
