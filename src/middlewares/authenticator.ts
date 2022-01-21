import { Types } from 'mongoose'
import { HBE010_NOT_AUTHENTICATED, HBE016_USER_SESSION_EXPIRED, HBE017_NOT_AUTHORIZED } from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { ContestModel, ContestSchemaModel } from '../models/contest'

/**
 * Authentication Middleware for WebCommands
 */
export const webCommandAuthenticator = (req, res, next) => {
	const token = req.query.token
	if (token !== process.env.WEB_COMMAND_TOKEN) { next(new HubbersBaseError(HBE010_NOT_AUTHENTICATED)) } else { next() }
}

/**
 * Authentication Middleware for Users
 */
export const userAuthenticator = (req, res, next) => {
	if (!req.user) {
		next(new HubbersBaseError(HBE010_NOT_AUTHENTICATED))
	} else if (req.user && (req.user.exp < (new Date().getTime() / 1000))) {
		next(new HubbersBaseError(HBE016_USER_SESSION_EXPIRED))
	} else {
		next()
	}
}

/**
 * Authentication Middleware for Contestant
 */
export const contestantParticipantAuthenticator = (req, res, next) => {
	ContestSchemaModel.findOne({
		contestants: {
			$elemMatch: {
				user: Types.ObjectId(req.user._id),
				isActive: true
			}
		}
	}).then((contest: ContestModel) => {
		if (!contest) { next(new HubbersBaseError(HBE017_NOT_AUTHORIZED)) } else { next() }
	})
}

/**
 * Authentication Middleware for Judge
 */
export const judgeParticipantAuthenticator = (req, res, next) => {
	ContestSchemaModel.findOne({
		judges: {
			$elemMatch: {
				user: Types.ObjectId(req.user._id),
				isActive: true
			}
		}
	}).then((contest: ContestModel) => {
		if (!contest) { next(new HubbersBaseError(HBE017_NOT_AUTHORIZED)) } else { next() }
	})
}

/**
 * Middleware for Entry Created by Logged User
 */
export const entryCreatedByLoggedUserAuthenticator = (req, res, next) => {
	ContestSchemaModel.findOne({
		$or: [{
			judges: {
				$elemMatch: {
					user: Types.ObjectId(req.user._id),
					isActive: true
				}
			}
		}, {
			entries: {
				$elemMatch: {
					contestant: Types.ObjectId(req.user._id)
				}
			}
		}
		]
	}).then((contest: ContestModel) => {
		if (!contest) { next(new HubbersBaseError(HBE017_NOT_AUTHORIZED)) } else { next() }
	})
}
/**
 * Authentication Middleware for Admins
 */
export const adminAuthenticator = (req, res, next) => {
	const admins = process.env.admins.split(',')

	if (admins.indexOf(req.user.email) !== -1) {
		req.user.isAdmin = true
		next()
	} else {
		next(new HubbersBaseError(HBE017_NOT_AUTHORIZED))
	}
}

/**
 * Login identityfier Middleware for Users
 */
export const isUserLoginAuthenticator = (req, res, next) => {
	
	if (req.user) {
		req.user.isLogin = true
		next()
	} else {
		next()
	}
}