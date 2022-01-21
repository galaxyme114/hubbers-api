import redisClient from '../utils/redisClient'

/**
 * Express route for storing user data for a given session
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const setUserData = (req, res) => {
	const sessionKey = req.body.sessionKey
	const data = JSON.stringify(req.body.data)

	redisClient.existsAsync(sessionKey).then(exists => {
		if (exists) {
			redisClient.setAsync(sessionKey, data)
				.then(() => res.json({ success: true }).status(200))
				.catch(() => res.json({ success: false }).status(422))
		} else {
			res.json({ success: false, error: 'Key does not exist' }).status(400)
		}
	})
}

/**
 * Express route for retrieving user data for a given session
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const getUserData = (req, res) => {
	const sessionKey = req.query.sessionKey

	redisClient.existsAsync(sessionKey).then(exists => {
		if (exists) {
			redisClient.getAsync(sessionKey)
				.then(data => res.json(JSON.parse(data)).status(200))
				.catch(error => res.json(error).status(400))
		} else {
			res.json({ success: false, error: 'Key does not exist' }).status(400)
		}
	})
}