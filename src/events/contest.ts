import {
	HBET007_NOTIFY_ADMINS_FOR_NEW_CONTESTANT,
	HBET007_NOTIFY_ADMINS_FOR_NEW_JUDGE,
	HBET007_NOTIFY_CONTESTANT_FOR_APPROVED,
	HBET007_NOTIFY_JUDGE,
	HBET007_NOTIFY_JUDGE_FOR_APPROVED
} from '../constants/emailTemplate'

import { EmailBuilder } from '../utils/emailClient'

import { ContestantApplicationRecord, ContestRecord } from '../interfaces/contest'
import { UserRecord } from '../interfaces/user'
import { ContestModel, ContestSchemaModel, JudgeParticipationModel } from '../models/contest'
import { UserModel, UserSchemaModel } from '../models/user'
import { EntryRatingRecord } from '../interfaces/entry'

export interface ContestUserApplicationNotify {
	contest: Partial<ContestRecord>
	user: Partial<UserRecord>
}

/**
 * Notify judges for a new entry on their subscribed contest
 *
 * @param contestId
 */
export const notifyJudgeGroup = (contestId: string) => {
	return new Promise(async (resolve, reject) => {
		try {
			const contest = await ContestSchemaModel.findById(contestId)
				.populate('judges.user').populate('contestants.user')

			const activeJudges = contest.judges.filter(j => j.isActive)
			const pendingJudges = []

			activeJudges.map((judge: JudgeParticipationModel) => {
				const unmarkedEntries = contest.entries.filter(entry =>
					entry.ratings.filter((rating: EntryRatingRecord) => rating.judgeId === judge._id).length === 0)

				if (unmarkedEntries.length > 0) {
					const judgeUser = judge.user as UserModel

					pendingJudges.push({
						name: judgeUser.fullName,
						email: judgeUser.email,
						contestName: contest.name,
						waitingContestants: unmarkedEntries.map(entry => entry.contestant)
					})
				}
			})

			pendingJudges.map(pj => doNotifyJudgeGroup(pj.name, pj.email, contest, pj.waitingContestants))
		} catch (error) {
			reject(error)
		}
	})
}

const doNotifyJudgeGroup =
	(recipientName: string, recipientEmail: string, contest: ContestModel, contestants: ContestantApplicationRecord[]) => {
		const to = [recipientEmail, ...process.env.ADMINS.split(',')]
		const mailData = {
			name: recipientName,
			contestName: contest.name,
			contestShortId: contest.shortId,
			contestSlug: contest.slug,
			totalContestant: contestants.length,
			contestants
		}

		const eb = new EmailBuilder(HBET007_NOTIFY_JUDGE, to, mailData)
		return eb.send()
	}

/**
 * Notify the admins for a new contestant application
 *
 * @param application
 */
export const notifyAdminsNewContestantApplication = (application: ContestUserApplicationNotify) => {
	const adminEmails = process.env.ADMINS.split(',')
	adminEmails.map(adminEmail =>
		doNotifyNotifyAdminsNewContestantApplication(adminEmail, application.contest.name, application.user.fullName))
}

const doNotifyNotifyAdminsNewContestantApplication =
	(recipientEmail: string, contestName: string, contestantFullName: string) => {
		const to = [recipientEmail, ...process.env.ADMINS.split(',')]
		const mailData = { contestName, contestantFullName }

		const eb = new EmailBuilder(HBET007_NOTIFY_ADMINS_FOR_NEW_CONTESTANT, to, mailData)
		return eb.send()
	}

/**
 * Notify the admins for a new judge application
 *
 * @param application
 */
export const notifyAdminsNewJudgeApplication = (application: ContestUserApplicationNotify) => {
	const adminEmails = process.env.ADMINS.split(',')

	adminEmails.map(adminEmail =>
		doNotifyAdminsNewJudgeApplication(adminEmail, application.contest.name, application.user.fullName))
}

const doNotifyAdminsNewJudgeApplication = (recipientEmail: string, contestName: string, judgeFullName: string) => {
	const to = [recipientEmail, ...process.env.ADMINS.split(',')]
	const mailData = { contestName, judgeFullName }

	const eb = new EmailBuilder(HBET007_NOTIFY_ADMINS_FOR_NEW_JUDGE, to, mailData)
	return eb.send()
}

/**
 * Notify the user when their application is approved
 *
 * @param application
 */
export const notifyContestantApplicationApproved = (application: ContestUserApplicationNotify) => {
	return doNotifyContestantApplicationApproved(
		application.user.email, application.user.fullName, application.contest.shortId, application.contest.slug)
}

const doNotifyContestantApplicationApproved =
	(recipientEmail: string, contestantFullName: string, shortId: string, slug: string) => {
		const to = [recipientEmail, ...process.env.ADMINS.split(',')]
		const mailData = { contestantFullName, shortId, slug }

		const eb = new EmailBuilder(HBET007_NOTIFY_CONTESTANT_FOR_APPROVED, to, mailData)
		return eb.send()
	}

/**
 * Notify the user when their application is approved
 *
 * @param application
 */
export const notifyJudgeApplicationApproved = (application: ContestUserApplicationNotify) => {
	return doNotifyJudgeApplicationApproved(
		application.user.email, application.user.fullName, application.contest.shortId, application.contest.slug)
}

const doNotifyJudgeApplicationApproved =
	(recipientEmail: string, judgeFullName: string, shortId: string, slug: string) => {
		const to = [recipientEmail, ...process.env.ADMINS.split(',')]
		const mailData = { judgeFullName, shortId, slug }

		const eb = new EmailBuilder(HBET007_NOTIFY_JUDGE_FOR_APPROVED, to, mailData)
		return eb.send()
	}


/**
* User has participated in the contest as a contestant
*
* @param application
*/
export const participateContestantActivity = (application: ContestUserApplicationNotify) => {
	return new Promise(async (resolve, reject) => {
		try {
			let userId = (application.user as UserModel)._id
			let userActivity = [{
				entityType: 'contest',
				entityId: (application.contest as ContestModel)._id,
				message: `${application.user.name} has participated in the contest ${application.contest.name} as a contestant`
			}]
			UserSchemaModel.findOneAndUpdate({ _id: userId }, { $push: { userActivity: userActivity } }).then().catch((error) => reject(error))
		} catch (error) {
			reject(error)
		}
	})
}


/**
* User has participated in the contest as a judge
*
* @param application
*/
export const participateJudgeActivity = (application: ContestUserApplicationNotify) => {
	return new Promise(async (resolve, reject) => {
		try {
			let userId = (application.user as UserModel)._id
			let userActivity = [{
				entityType: 'contest',
				entityId: (application.contest as ContestModel)._id,
				message: `${application.user.name} has participated in the contest ${application.contest.name} as an awards judge`
			}]
			UserSchemaModel.findOneAndUpdate({ _id: userId }, { $push: { userActivity: userActivity } }).then().catch((error) => reject(error))
		} catch (error) {
			reject(error)
		}
	})
}


/**
* User likes a contest
*
* @param contest
*/
export const contestContestantLikeActivity = (application: ContestUserApplicationNotify) => {
	return new Promise(async (resolve, reject) => {
		try {

			let userId = (application.user as UserModel)._id
			let contestId = (application.contest as ContestModel)._id
			let userActivity = [{
				entityType: 'contest',
				entityId: contestId,
				message: ` ${application.user.name} has liked the contest ${application.contest.name}`
			}]
			UserSchemaModel.findOneAndUpdate({ _id: userId }, { $push: { userActivity: userActivity } }).then().catch((error) => reject(error))
		} catch (error) {
			reject(error)
		}
	})
}

/**
* User has submitted an entry for a given contest
*
* @param contest
*/
export const contestantSubmitEntry = (application: ContestUserApplicationNotify) => {
	return new Promise(async (resolve, reject) => {
		try {
			const foundContest = await ContestSchemaModel.findOne({_id: application.contest})

			let userId = (application.user as UserModel)._id
			let contestId = application.contest
			let userActivity = [{
				entityType: 'contest',
				entityId: contestId,
				message: ` ${application.user.name} has submitted a new entry on the contest ${foundContest.name}`
			}]

			UserSchemaModel.findOneAndUpdate({ _id: userId }, { $push: { userActivity: userActivity } }).then().catch((error) => reject(error))
		} catch (error) {
			reject(error)
		}
	})
}