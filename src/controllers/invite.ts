import { Types } from 'mongoose'
import { HBE040_NOT_FOUND, HBE041_INVITATION_NOT_FOUND } from '../constants/errors'
import { HubbersBaseError } from '../errors/index'
import { InviteContestant, InviteExpert, InviteExpertise, InviteJudge, InviteObserver } from '../interfaces/invite'
import {
	InviteContestantModel, InviteContestantSchemaModel,
	InviteExpertiseModel,
	InviteExpertiseSchemaModel,
	InviteExpertModel,
	InviteExpertSchemaModel, InviteJudgeModel, InviteJudgeSchemaModel, InviteObserverModel, InviteObserverSchemaModel
} from '../models/invite'

/**
 * Fetch an expert invitation
 */
export const fetchExpertInvitation = (invitationCode: string) => {
	return new Promise<InviteExpertModel>((resolve, reject) => {
		InviteExpertSchemaModel.findOne({ _id: invitationCode })
			.then((foundInvite) => {
				return foundInvite ? resolve(foundInvite) : reject(new HubbersBaseError(HBE041_INVITATION_NOT_FOUND))
			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND)))
	})
}

/**
 * Fetch an observer invitation
 */
export const fetchObserverInvitation = (invitationCode: string) => {
	return new Promise<InviteObserverModel>((resolve, reject) => {
		InviteObserverSchemaModel.findOne({ _id: invitationCode })
			.then((foundInvite) => {
				return foundInvite ? resolve(foundInvite) : reject(new HubbersBaseError(HBE041_INVITATION_NOT_FOUND))
			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND)))
	})
}

/**
 * Fetch an contestant invitation
 */
export const fetchContestantInvitation = (invitationCode: string) => {
	return new Promise<InviteContestantModel>((resolve, reject) => {
		InviteContestantSchemaModel.findOne({ _id: invitationCode })
			.then((foundInvite) => {
				return foundInvite ? resolve(foundInvite) : reject(new HubbersBaseError(HBE041_INVITATION_NOT_FOUND))
			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND)))
	})
}

/**
 * Fetch an judge invitation
 */
export const fetchJudgeInvitation = (invitationCode: string) => {
	return new Promise<InviteJudgeModel>((resolve, reject) => {
		InviteJudgeSchemaModel.findOne({ _id: invitationCode })
			.then((foundInvite) => {
				return foundInvite ? resolve(foundInvite) : reject(new HubbersBaseError(HBE041_INVITATION_NOT_FOUND))
			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND)))
	})
}

/**
 *
 * @param {InviteExpert} inviteData
 * @returns {Promise<InviteExpertModel>}
 */
export const createExpertInvitation = (inviteData: InviteExpert) => {
	return new Promise<InviteExpertModel>((resolve, reject) => {
		InviteExpertSchemaModel.findOne({ email: inviteData.email })
			.then((foundInvite) => {
				if (foundInvite) { resolve(foundInvite) } else {
					const invite = new InviteExpertSchemaModel(inviteData)
					invite.save()
						.then((newInvite: InviteExpertModel) => resolve(newInvite))
						.catch((error: any) => reject(error))
				}
			}).catch((error: any) => reject(error))
	})
}

/**
 * Create an observer invitation
 * @param {InviteObserver} inviteData
 * @returns {Promise<InviteObserverModel>}
 */
export const createObserverInvitation = (inviteData: InviteObserver) => {
	return new Promise<InviteObserverModel>((resolve, reject) => {
		InviteObserverSchemaModel.findOne({ email: inviteData.email })
			.then((foundInvite) => {
				if (foundInvite) { resolve(foundInvite) } else {
					const invite = new InviteObserverSchemaModel(inviteData)
					invite.save()
						.then((newInvite: InviteObserverModel) => resolve(newInvite))
						.catch((error: any) => reject(error))
				}
			}).catch((error: any) => reject(error))
	})
}

/**
 * Create a contestant invitation
 * @param {InviteContestant} inviteData
 * @returns {Promise<InviteContestantModel>}
 */
export const createContestantInvitation = (inviteData: InviteContestant) => {
	return new Promise<InviteContestantModel>((resolve, reject) => {
		InviteContestantSchemaModel.findOne({ email: inviteData.email })
			.then((foundInvite) => {
				if (foundInvite) { resolve(foundInvite) } else {
					const invite = new InviteContestantSchemaModel(inviteData)
					invite.save()
						.then((newInvite: InviteContestantModel) => resolve(newInvite))
						.catch((error: any) => reject(error))
				}
			}).catch((error: any) => reject(error))
	})
}

/**
 * Create an judge invitation
 * @param {InviteJudge} inviteData
 * @returns {Promise<InviteJudgeModel>}
 */
export const createJudgeInvitation = (inviteData: InviteJudge) => {
	return new Promise<InviteJudgeModel>((resolve, reject) => {
		InviteJudgeSchemaModel.findOne({ email: inviteData.email })
			.then((foundInvite) => {
				if (foundInvite) { resolve(foundInvite) } else {
					const invite = new InviteJudgeSchemaModel(inviteData)
					invite.save()
						.then((newInvite: InviteJudgeModel) => resolve(newInvite))
						.catch((error: any) => reject(error))
				}
			}).catch((error: any) => reject(error))
	})
}

export const createExpertiseInvitation = (inviteData: InviteExpertise) => {
	return new Promise<InviteExpertiseModel>((resolve, reject) => {
		InviteExpertiseSchemaModel.findOne({ name: inviteData.name })
			.then((foundInvite) => {
				if (foundInvite) { resolve(foundInvite) } else {
					const invite = new InviteExpertiseSchemaModel(inviteData)
					invite.save()
						.then((newInvite: InviteExpertiseModel) => resolve(newInvite))
						.catch((error: any) => reject(error))
				}
			}).catch((error: any) => reject(error))
	})
}