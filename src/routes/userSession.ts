import { SHA256 } from 'crypto-js'
import { HBET001_NEW_USER_ADMIN } from '../constants/emailTemplate'
import { EmailBuilder } from '../utils/emailClient'
import redisClient from '../utils/redisClient'

/**
 * Express route for creating and returning a user session
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const store = (req, res) => {
	let uniqueIdentifier = req.body.userEmail
	let shouldNotify = true

	// Generate a random hash if there is no email given
	if (!uniqueIdentifier) {
		uniqueIdentifier = Math.random().toString(36).substring(7)
		shouldNotify = false
	}

	// Delete the current session
	redisClient.getAsync(uniqueIdentifier).then((sessionKey) => {
		if (sessionKey) {
			redisClient.del(sessionKey)
			shouldNotify = false
		}
	})

	// Create a new session
	const newSessionKey = SHA256(uniqueIdentifier + process.env.SALT + (new Date().getTime())).toString()

	// Set the session and notify admins of a new user
	return redisClient.setAsync(uniqueIdentifier, newSessionKey)
		.then(() => redisClient.setAsync(newSessionKey, JSON.stringify({})))
		.then(() => res.json({ sessionKey: newSessionKey }).status(200))
		.catch(error => res.json({ error }).status(400))
		.then(() => shouldNotify ? notifyRegistration(uniqueIdentifier) : null)
		.catch(error => console.error('Can\'t send emails', error))
}

/**
 * Send email to notify a new registration
 *
 * @returns {Promise<[ClientResponse , {}]>}
 */
const notifyRegistration = (email: string) => {
	const eb = new EmailBuilder(HBET001_NEW_USER_ADMIN, process.env.ADMINS.split(','), { email })
	return eb.send()
}