import { clear as clearGlobalCache } from 'apicache'

import {
	syncEvents as SyncEventsFunction
} from '../controllers/events'
import {
	// syncExpertise as SyncExpertiseFunction,
	syncExpertiseCategory as SyncExpertiseCategoryFunction
} from '../controllers/expertise'

import { HBE003_FAILED_TO_FETCH } from '../constants/errors'
import { importUsersFunction } from '../controllers/userImport'
import { HubbersBaseError } from '../errors'

/**
 * Web Commands | Cache reset
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const cacheReset = (req, res) => {
	clearGlobalCache()
	res.json({ success: true })
}

/**
 * Web Commands | Sync Expertise
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const syncExpertise = (req, res) => {
	res.json({ success: true })
}

/**
 * Web Commands | Sync Expertise Category
 *
 */
export const syncExpertiseCategory = (req, res, next) => {
	SyncExpertiseCategoryFunction()
		.then(response => res.json(response))
		.catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Web Commands | Sync Events
 *
 */
export const syncEvents = (req, res, next) => {
	SyncEventsFunction()
		.then(response => res.json(response))
		.catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Web Commands | Import Users
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const importUsers = (req, res, next) => {
	const ids = req.query.ids ? req.query.ids.split(',') : []
	importUsersFunction(ids)
		.then(response => res.json(response))
		.catch(error => next(error))
}