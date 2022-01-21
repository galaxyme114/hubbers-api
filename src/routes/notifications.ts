import { check } from 'express-validator/check'
import { fetchAllNotifications, updateNotificationsSeen  } from '../controllers/notifications'
import { requestValidator } from '../middlewares/errorHandler'

/**
 * Express route for fetching a list of notifications
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const index = (req, res, next) => {
	fetchAllNotifications(req.user._id)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express route for updating the seen status of a list of notifications
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const seenMiddleware = [
	check('notificationIds').exists(),
	requestValidator
]
export const seen = (req, res, next) => {
	const userId = req.user._id
	const notificationIds = req.body.notificationIds

	updateNotificationsSeen(userId, notificationIds)
		.then(() => fetchAllNotifications(req.user._id))
		.then((response) => res.json(response))
		.catch(error => next(error))
}