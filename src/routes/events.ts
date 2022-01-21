import { setupCache } from 'axios-cache-adapter'
import { check } from 'express-validator/check'
import { filterObject } from '../utils/stringUtils'

import { adminCreateEvent, adminFetchAllEvents, adminFetchEventById, adminRemoveEvent, adminUpdateEventAttendance, fetchAllEvents, fetchEventById, updateEventAttendance } from '../controllers/events'
import { requestValidator } from '../middlewares/errorHandler'
import { EventUpdateFilterKeys, EventValidationKeys } from '../models/event'

/**
 * Express admin route for create events
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const createMiddleware = [...EventValidationKeys, requestValidator]

export const adminCreate = (req, res, next) => {
	const newEventData = filterObject(req.body, EventUpdateFilterKeys)

	adminCreateEvent(newEventData)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express route for fetching events
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const index = (req, res, next) => {
	fetchAllEvents()
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express admin route for fetching events
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminIndex = (req, res, next) => {
	adminFetchAllEvents()
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express route for fetching a single event
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetch = (req, res, next) => {
	const eventId = req.params.eventId

	fetchEventById(eventId)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express admin route for fetching a single event
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetch = (req, res, next) => {
	const eventId = req.params.eventId

	adminFetchEventById(eventId)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express route for updating event attendance
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */

export const updateAttendanceMiddleware = [
	check('attending').exists(),
	check('attending').isBoolean(),
	requestValidator
]

export const updateAttendance = (req, res, next) => {
	const eventId = req.params.eventId
	const attending = req.body.attending
	const userId = req.user._id

	updateEventAttendance(userId, eventId, attending === 'true')
		.then((response) => res.json(response))
		.catch(error => next(error))
}

/**
 * Express admin route for updating event attendance
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminUpdateAttendanceMiddleware = [...EventValidationKeys, requestValidator]
export const adminUpdateAttendance = (req, res, next) => {
	const updateEventData = filterObject(req.body, EventUpdateFilterKeys)
	const eventId = req.params.eventId

	adminUpdateEventAttendance(eventId, updateEventData)
		.then((response) => res.json(response))
		.catch(error => next(error))
}

/**
 * Express admin route for delete event
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminRemove = (req, res, next) => {
	const eventId = req.params.eventId

	adminRemoveEvent(eventId)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}
