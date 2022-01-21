import { Types } from 'mongoose'

import {
	ContestantParticipationModel,
	ContestModel,
	ContestSchemaModel,
	JudgeParticipationModel
} from '../models/contest'
import { UserModel, UserSchemaModel } from '../models/user'

import { defaultPrizes } from '../constants/prizes'

import {
	HBE003_FAILED_TO_FETCH,
	HBE004_FAILED_TO_CREATE,
	HBE006_FAILED_TO_UPDATE,
	HBE007_FAILED_TO_DELETE,
	HBE040_NOT_FOUND
} from '../constants/errors'
import { HubbersBaseError } from '../errors'

import { ContestRecord } from '../interfaces/contest'
import { USER_POPULATE_SELECT } from '../constants/legacyDbSelect'

/**
 * Fetch all contests
 *
 * @param userId
 * @param allowDraft
 */
export const fetchAllContest = (userId: string, allowDraft: boolean) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.find(!allowDraft ? { isDraft: false } : {})
			.sort('-startTime')
			.then((contests: ContestModel[]) => {
				const allContests = contests.map((contest: ContestModel) => {
					let memberApplication = null
					
					if (userId) {
						// Contest active application
						const activeContestant = contest.contestants.find(ue => ue.user ? ue.user.toString() === userId.toString() : null)
						const activeJudge = contest.judges.find(ue => ue.user ? ue.user.toString() === userId.toString() : null)
						
						if (activeJudge) {
							memberApplication = {type: 'judge', isPending: !activeJudge.isActive, date: activeJudge.createdAt}
						} else if (activeContestant) {
							memberApplication = {type: 'contestant', isPending: !activeContestant.isActive, date: activeContestant.createdAt}
						}
					}
					
					return { ...contest.toObject(), memberApplication }
				})
				
				resolve(allContests)
			}).catch(error => {
				console.log('error displayed for loading contests', error)
				reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
		})
	})
}

/**
 * For User Fetch single Contest by Short Id
 *
 * @TODO: Contestant ranking
 * @TODO: Judge entry ratings
 *
 * @param contestId
 */
export const fetchContest = (contestId: string) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.findOne({_id: contestId})
			.populate('contestants.user').populate('judges.user')
			.then(async (contest: ContestModel) =>
				contest ? resolve(contest) : reject(new HubbersBaseError(HBE040_NOT_FOUND)))
			.catch((error) => {
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
		})
	})
}

/**
 * For User Fetch single Contest by Short Id
 *
 * @TODO: Contestant ranking
 * @TODO: Judge entry ratings
 *
 * @param contestShortId
 * @param userId
 */
export const fetchSingleByShortId = (contestShortId: string, userId?: string) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.findOne({shortId: contestShortId})
			.populate('contestants.user').populate('judges.user')
			.then(async (contest: ContestModel) => {
				if (contest) {
					const activeContestant = contest.contestants.find(
						(ue: ContestantParticipationModel) => ue.user ?
							(ue.user as UserModel)._id.toString() === userId.toString() : false)
					const activeJudge = contest.judges.find(
						(ue: JudgeParticipationModel) => ue.user ?
							(ue.user as UserModel)._id.toString() === userId.toString() : false)
					
					// Contest active application
					let memberApplication = null
					
					if (activeJudge) {
						memberApplication = {type: 'judge', isPending: !activeJudge.isActive, date: activeJudge.createdAt}
					} else if (activeContestant) {
						memberApplication = {type: 'contestant', isPending: !activeContestant.isActive, date: activeContestant.createdAt}
					}
					
					resolve({ ...contest.toObject(), memberApplication })
				} else {
					reject(new HubbersBaseError(HBE040_NOT_FOUND))
				}
			}).catch((error) => {
				console.log('error in fetching contest', error)
				reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
		})
	})
}

/**
 * Create Contest
 *
 * @param newContestData
 */
export const contestCreate = (newContestData: Partial<ContestRecord>) => {
	return new Promise<ContestModel>((resolve, reject) => {
		const contestData = Object.assign({prizes: defaultPrizes}, newContestData)
		const newContest = new ContestSchemaModel(contestData)
		newContest.save().then((contest: ContestModel) => {
			resolve(contest)
		}).catch((error: any) => {
			reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
		})
	})
}

/**
 * Get contest leaderboard by sending the contest short id
 *
 * @param shortId
 * @returns Promise
 */
export const getContestLeaderboard = (shortId: string) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.findOne({ shortId })
			.populate('contestants.user', USER_POPULATE_SELECT)
			.sort('-entries.createdAt')
			.then(async (contest: any) => {
				if (!contest) { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH)) } else {
					try {
						const contestants = contest.contestants.map(contestant => {
							const latestEntries = contest.entries
								.filter(entry => (entry.contestant ? entry.contestant.toString() ===
									(contestant.user ? contestant.user._id.toString() : false) : false) && !entry.isDraft)
							const latestEntry = latestEntries[0]
							
							let rating = null
							let designAvgRating = 0
							let functionalityAvgRating = 0
							let usabilityAvgRating = 0
							let marketPotentialAvgRating = 0
							
							if (latestEntry && latestEntry.ratings) {
								latestEntry.ratings.map(rat => {
									designAvgRating += rat.design
									functionalityAvgRating += rat.functionality
									usabilityAvgRating += rat.usability
									marketPotentialAvgRating += rat.marketPotential
								})
								
								const allRatings = {
									design: designAvgRating / latestEntry.ratings.length,
									functionality: functionalityAvgRating / latestEntry.ratings.length,
									usability: usabilityAvgRating / latestEntry.ratings.length,
									marketPotential: marketPotentialAvgRating / latestEntry.ratings.length
								}
								
								rating = {
									average: (allRatings.design + allRatings.functionality
										+ allRatings.usability + allRatings.marketPotential) / 4, ...allRatings
								}
							}
							
							return {
								...contestant.user.toObject(),
								currentRank: contestant.currentRank,
								previousRank: contestant.previousRank,
								rating
							}
						})
						
						const rankedContestants = contestants.filter(c => c.currentRank !== 0)
						const unRankedContestants = contestants.filter(c => c.currentRank === 0)
						rankedContestants.sort((a, b) => a.currentRank - b.currentRank)
						
						resolve([...rankedContestants, ...unRankedContestants])
					} catch (error) {
						console.log('error in empty response', error)
						resolve([])
					}
				}
			}).catch((error) => {
				reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
			})
	})
}

/**
 * Judge participate for a contest
 *
 * @param contestId
 * @param userId
 */
export const createParticipateJudgeForContest = (contestId: string, userId: string) => {
	return new Promise(async (resolve, reject) => {
		try {
			const user = UserSchemaModel.findById(userId)
			
			if (!user) { throw new HubbersBaseError(HBE003_FAILED_TO_FETCH) } else {
				// Check if judge exists
				ContestSchemaModel.findOneAndUpdate({$and:
							[{_id: contestId}, {'judges.user': {$not: {$eq: userId}}}, {'contestants.user': {$not: {$eq: userId}}}]},
					{ $push: { judges: { user: userId } } }, { new: true })
					.populate('contestants.user').populate('judges.user')
					.then(async (contest: ContestModel) => contest ? resolve(contest) :
						reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE)))
					.catch((error) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
			}
		} catch (error) {
			reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error))
		}
	})
}

/**
 * Contestant participate for a contest
 *
 * @param contestId
 * @param userId
 */
export const createParticipateContestantForContest = (contestId: string, userId: string) => {
	return new Promise((resolve, reject) => {
		try {
			const user = UserSchemaModel.findById(userId)
			
			if (!user) { throw new HubbersBaseError(HBE003_FAILED_TO_FETCH) } else {
				ContestSchemaModel.findOneAndUpdate({$and:
							[{_id: contestId}, {'judges.user': {$not: {$eq: userId}}}, {'contestants.user': {$not: {$eq: userId}}}]},
					{ $push: { contestants: { user: userId } } }, { new: true })
					.populate('contestants.user').populate('judges.user')
					.then(async (contest: ContestModel) => contest ? resolve(contest) :
						reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE)))
					.catch((error) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
			}
		} catch (error) {
			reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error))
		}
	})
}

/**
 * Update contest likes
 *
 * @param userId
 * @param contestId
 * @param liked
 */
export const updateContestLikes = (userId: string, contestId: string, liked: boolean) => {
	return new Promise<ContestModel>((resolve, reject) => {
		const action = liked ? {$addToSet: {likes: userId}} : {$pullAll: {likes: [userId]}}
		ContestSchemaModel.findOneAndUpdate({_id: contestId}, action,
			/* tslint:disable */ {'new': true}) /* tslint:enable */
			.then((contest: ContestModel) => {
				if (contest === null) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					resolve(contest)
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Update contest views
 *
 * @param contestId
 */
export const updateContestView = (contestId: string) => {
	return new Promise<ContestModel>((resolve, reject) => {
		ContestSchemaModel.findOneAndUpdate({_id: contestId}, {$inc: {views: 1}},
			/* tslint:disable */ {'new': true}) /* tslint:enable */
			.then((contest: ContestModel) => {
				if (contest === null) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					resolve(contest)
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Approve an application for a judge from admin
 *
 * @param contestId
 * @param judgeApplicationId
 * @param active
 */
export const adminApproveSingleJudge = (contestId: string, judgeApplicationId: string, active: boolean) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.findOneAndUpdate({_id: contestId, judges: {$elemMatch: {_id: judgeApplicationId}}}, {
			$set: {'judges.$.isActive': active } }, { new: true })
			.then((updatedContest: ContestModel) => {
				if (!updatedContest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					resolve({
						_id: updatedContest._id,
						shortId: updatedContest.shortId,
						slug: updatedContest.slug,
						approvedJudgeId: judgeApplicationId
					})
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Approve an application for a contestant from admin
 *
 * @param contestId
 * @param contestantApplicationId
 * @param active
 */
export const adminApproveSingleContestant = (contestId: string, contestantApplicationId: string, active: boolean) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.findOneAndUpdate({_id: contestId, contestants: {$elemMatch: {_id: contestantApplicationId}}}, {
			$set: {'contestants.$.isActive': active } }, { new: true })
			.then((updatedContest: ContestModel) => {
				if (!updatedContest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					resolve({
						_id: updatedContest._id,
						shortId: updatedContest.shortId,
						slug: updatedContest.slug,
						approvedContestantId: contestantApplicationId
					})
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Delete a contest from admin
 *
 * @param contestId
 */
export const adminDeleteContest = (contestId: string) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.deleteOne({ _id: contestId })
			.then((contest: any) => {
				if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					resolve(contest)
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * Update contest panel from admin
 *
 * @param bodyData
 * @param contestId
 */
export const adminUpdateContestFunc = (bodyData: any, contestId: string) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.findOneAndUpdate({ _id: contestId },
			{ $set: bodyData }, { new: true })
			.then((contest: any) => {
				if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					resolve(contest)
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * Delete contest application from admin
 *
 * @param contestId
 * @param contestantsApplicationId
 */
export const adminDeleteContestantApplication = (contestId: string, contestantsApplicationId: string) => {
	return new Promise<ContestModel>((resolve, reject) => {
		ContestSchemaModel.findOne({ _id: contestId })
			.then((contest: ContestModel) => {
				if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					ContestSchemaModel.update({ _id: contestId },
						{ $pull: {contestants: {_id: Types.ObjectId(contestantsApplicationId)}} })
						.then((updatedContest: ContestModel) => resolve(updatedContest))
						.catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
				}
			}).catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
	})
}

/**
 * Delete judge application from admin
 *
 * @param contestId
 * @param judgeApplicationId
 */
export const adminDeleteJudgeApplication = (contestId: string, judgeApplicationId: string) => {
	return new Promise<ContestModel>((resolve, reject) => {
		ContestSchemaModel.findOne({_id: contestId})
			.then((contest: ContestModel) => {
				if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					ContestSchemaModel.update({_id: contestId},
						{ $pull: {judges: {_id: judgeApplicationId}} })
						.then((updatedContest: any) => resolve(updatedContest))
						.catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
				}
			}).catch(error => reject(new HubbersBaseError(error)))
	})
}