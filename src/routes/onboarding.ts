import { check } from 'express-validator/check'
import { Types } from 'mongoose'
import { HBE012_FAILED_TO_REGISTER } from '../constants/errors'
import { createParticipateContestantForContest, createParticipateJudgeForContest } from '../controllers/contests'
import {
	fetchContestantInvitation,
	fetchJudgeInvitation,
	fetchObserverInvitation
} from '../controllers/invite'
import { HubbersBaseError } from '../errors'
import { NotifyNewObserver } from '../events/notify'
import { requestValidator } from '../middlewares/errorHandler'
import { UserSchemaModel } from '../models/user'

import * as bcrypt from 'bcrypt-nodejs'

import {
	InviteContestantModel,
	InviteContestantSchemaModel,
	InviteJudgeSchemaModel,
	InviteObserverSchemaModel
} from '../models/invite'

/**
 * Onboarding route for observers
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const observerMiddleware = [
	check('email').not().isEmpty(),
	check('email').isEmail(),
	check('name').not().isEmpty(),
	check('nationality').not().isEmpty(),
	check('password').not().isEmpty(),
	check('code').not().isEmpty(),
	requestValidator
]

export const observer = (req, res, next) => {
	const securityToken = process.env.LEGACY_API_TOKEN
	const userData = req.body
	const code = userData.code
	userData.isHubbersInvestor = true
	userData.securityToken = securityToken
	userData.roles = ['investor']
	userData.locations = [{
		country: userData.nationality
	}]
	userData.lastName = userData.last_name
	const salt = bcrypt.genSaltSync()
	userData.password = bcrypt.hashSync(userData.password, salt)
	
	if (userData.thumbnailImageUrl) {
		userData.thumbnailImageUrl = userData.thumbnail
	}
	fetchObserverInvitation(userData.code)
		.then(() => {
			delete userData.code
			// Attempt to login the user
			return UserSchemaModel.create(userData)
				.then((response: any) => {
					const newObserver: NotifyNewObserver = {
						id: response._id.toString(),
						name: response.name,
						thumbnailImageUrl: response.thumbnailImageUrl,
						nationality: response.locations[0].country
					}
					res.app.emit('notify:new-observer', newObserver)
					return InviteObserverSchemaModel.findOneAndRemove({ _id: Types.ObjectId(code) })
						.then(() => res.json(response))
				}).catch((error: any) => { next(new HubbersBaseError(HBE012_FAILED_TO_REGISTER, error)) })
		}).catch((error: HubbersBaseError) => next(error))
}

/**
 * Onboarding route for contestant
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const contestantMiddleware = [
	check('email').not().isEmpty(),
	check('email').isEmail(),
	check('name').not().isEmpty(),
	check('nationality').not().isEmpty(),
	check('code').not().isEmpty(),
	requestValidator
]

export const contestant = (req, res, next) => {
	const securityToken = process.env.LEGACY_API_TOKEN
	const userData = req.body
	const code = userData.code
	userData.securityToken = securityToken
	userData.roles = ['contestant']
	userData.locations = [{
		country: userData.nationality
	}]
	const salt = bcrypt.genSaltSync()
	userData.password = bcrypt.hashSync(userData.password, salt)
	
	if (userData.thumbnailImageUrl) {
		userData.thumbnailImageUrl = userData.thumbnail
	}
	
	fetchContestantInvitation(code)
		.then((invitation: InviteContestantModel) => {
			
			// Attempt to login the user
			delete userData.code
			return UserSchemaModel.create(userData)
				.then(async (response: any) => {
					await createParticipateContestantForContest(invitation.contestId, userData._id.toString())
					return await InviteContestantSchemaModel.findOneAndRemove({ _id: Types.ObjectId(code) })
						.then(() => res.json(response.data))
				}).catch((error: any) => next(new HubbersBaseError(HBE012_FAILED_TO_REGISTER, error)))
		}).catch((error: HubbersBaseError) => next(error))
}

/**
 * Onboarding route for judge
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const judgeMiddleware = [
	check('email').not().isEmpty(),
	check('email').isEmail(),
	check('name').not().isEmpty(),
	check('nationality').not().isEmpty(),
	check('code').not().isEmpty(),
	requestValidator
]

export const judge = (req, res, next) => {
	const securityToken = process.env.LEGACY_API_TOKEN
	const userData = req.body
	const code = userData.code
	userData.securityToken = securityToken
	userData.roles = ['judge']
	userData.locations = [{
		country: userData.nationality
	}]
	const salt = bcrypt.genSaltSync()
	userData.password = bcrypt.hashSync(userData.password, salt)
	
	if (userData.thumbnailImageUrl) {
		userData.thumbnailImageUrl = userData.thumbnail
	}
	
	fetchJudgeInvitation(code)
		.then((invitation: InviteContestantModel) => {
			// Attempt to login the user
			delete userData.code
			return UserSchemaModel.create(userData)
				.then(async (response: any) => {
					await createParticipateJudgeForContest(invitation.contestId, userData._id.toString())
					return await InviteJudgeSchemaModel.findOneAndRemove({ _id: Types.ObjectId(code) })
						.then(() => res.json(response.data))
				}).catch((error: any) => next(new HubbersBaseError(HBE012_FAILED_TO_REGISTER, error)))
		}).catch((error: HubbersBaseError) => next(error))
}