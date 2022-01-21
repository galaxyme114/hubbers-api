import { Types } from 'mongoose'

import {
	HBE003_FAILED_TO_FETCH,
	HBE004_FAILED_TO_CREATE,
	HBE005_ALREADY_EXISTS,
	HBE006_FAILED_TO_UPDATE,
	HBE007_FAILED_TO_DELETE,
	HBE040_NOT_FOUND
} from '../constants/errors'

import { HubbersBaseError } from '../errors'

import { USER_POPULATE_SELECT, USER_POPULATE_SELECT_ARRAY } from '../constants/legacyDbSelect'
import { EntryAttachmentRecord } from '../interfaces/entry'
import { ContestModel, ContestSchemaModel, JudgeParticipationModel } from '../models/contest'
import { ConversationSchemaModel } from '../models/conversation'
import { EntryModel, fillRawEntryModel } from '../models/entry'
import { fillRawUserModel } from '../models/user'
import { filterObject } from '../utils/stringUtils'

/**
 * Create an entry for a user
 *
 * @param newEntryData
 * @param contestId
 * @param contestantId
 */
export const entryCreate = async (newEntryData: any, contestId: string, contestantId: string) => {
	return new Promise(async (resolve, reject) => {
		// Create an associating conversation for an entry
		let conversation = new ConversationSchemaModel({ author: contestantId, participants: contestantId })
		conversation = await conversation.save()
		
		// Prepare entry data
		const entryData = {
			contestant: contestantId,
			conversation: conversation._id,
			contest: contestId,
			...newEntryData
		}
		
		ContestSchemaModel.findOne({ _id: contestId })
			.then((foundContest: ContestModel) => {
				const foundEntries = foundContest.entries.filter((entry: EntryModel) =>
					entry.contestant.toString() === contestantId.toString())
				
				if (foundEntries.length > 4 ) { reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE)) } else {
					ContestSchemaModel.findOneAndUpdate({ _id: contestId },
						{ $push: { entries: entryData } }, {/*  tslint: disable */ new: true /*  tslint: enable  */ })
						.populate('entries.conversation').populate('entries.contest')
						.populate('entries.contestant', USER_POPULATE_SELECT)
						.then((contest: ContestModel) => resolve(contest))
						.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
				}
			})
	})
}

/**
 * Fetch a single contest entry
 *
 * @param userId
 * @param entryId
 */
export const fetchSingleContestEntry = (entryId: string, userId: string) => {
	return new Promise< any >((resolve, reject) => {
		ContestSchemaModel.findOne({ 'entries._id': Types.ObjectId(entryId) })
			.populate('entries.contestant', USER_POPULATE_SELECT).populate('entries.ratings.judge', USER_POPULATE_SELECT)
			.then(async (contest: ContestModel) => {
				if (!contest) { resolve([]) } else {
					const foundEntry = contest.entries.find(entry => entry._id.toString()  === entryId)
					if (!foundEntry) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
						const myRating = foundEntry.ratings.find(r => r.judge._id.toString() === userId.toString())
						
						resolve({
							...foundEntry.toObject(),
							rating: calculateAvgRating(foundEntry),
							myRating: myRating ? calculateAvgSingleRating(myRating) : undefined
						})
					}
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Fetch all ratings for a single entry
 *
 * @param entryId
 */
export const fetchAllRating = (entryId: string) => {
	return new Promise< any >((resolve, reject) => {
		ContestSchemaModel.findOne({ 'entries._id': Types.ObjectId(entryId) })
			.populate('entries.contestant', USER_POPULATE_SELECT)
			.then(async (contest: ContestModel) => {
			if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
				const foundEntry =  contest.entries.find((entry: any) => entry._id.toString()  === entryId)
				const foundRatingList = foundEntry.ratings.filter( (r: any) => typeof(r.judge) !== 'undefined' )
				const filterRejectJudgesRating = []
				
				contest.judges.map((j: JudgeParticipationModel) => {
					const judgeRatings = foundRatingList.filter(r =>  j.id === r.judge.toString() && j.isActive === true)
					if (judgeRatings.length > 0) {
						filterRejectJudgesRating.push(judgeRatings[0])
					}
				})
			}
		}).catch((error: any) => reject(new HubbersBaseError( error)))
	})
}

/*
* Admin Fetch Single Rating
*
* */
export const adminFetchAllRating = (entryId: string, ratingId: string) => {
	return new Promise< any >((resolve, reject) => {
		// ContestSchemaModel.find({ 'entries._id': Types.ObjectId(entryId)
		// }).then(async (contest: any) => {
		// 	if (contest.length === 0 ) {
		// 		resolve(contest)
		// 	} else {
		// 		const foundEntry =  contest[0].entries.filter( (entry: any) => entry._id.toString()  === entryId )
		// 		const foundRating = foundEntry[0].ratings.filter( (r: any) => r._id.toString() === ratingId )
		//
		// 		const singleRating = await getUserInfo(foundRating[0])
		//
		// 		resolve(singleRating)
		// 	}
		// }).catch((error: any) => reject(new HubbersBaseError( error)))
	})
}

/**
 * Function to fetch the entries for a single contestant
 *
 * @param contestId
 * @param contestantId
 */
export const fetchContestContestantEntry = (contestId: string, contestantId: string) => {
	return new Promise <EntryModel[]> ((resolve, reject) => {
		ContestSchemaModel.findById(contestId)
			.then((contest: ContestModel) => {
				if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					ContestSchemaModel.aggregate([
						{ $match: { _id: Types.ObjectId(contestId) } },
						{ $unwind: '$entries' },
						{ $match: { 'entries.contestant': contestantId } },
						{ $sort: { 'entries.createdAt': -1 } },
						{
							$project: {
								_id: '$entries._id',
								title: '$entries.title',
								contest: '$entries.contest',
								contestant: '$entries.contestant',
								descriptionDesign: '$entries.descriptionDesign',
								descriptionFunctionality: '$entries.descriptionFunctionality',
								descriptionUsability: '$entries.descriptionUsability',
								descriptionMarketPotential: '$entries.descriptionMarketPotential',
								isDraft: '$entries.isDraft',
								featuredImageUrl: '$entries.featuredImageUrl',
								attachments: '$entries.attachments',
								ratings: '$entries.ratings',
								createdAt: '$entries.createdAt',
								updatedAt: '$entries.updatedAt'
							}
						}
					]).then(async (entries: EntryModel[]) => {
						const updatedEntries = entries.map((entry: EntryModel) => {
							return { ...fillRawEntryModel(entry), marksGiven: entry.ratings.length, rating: calculateAvgRating(entry) }
						})
						
						resolve(updatedEntries)
					}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Function to fetch the entries for a single judge
 *
 * @param contestId
 * @param judgeId
 */
export const fetchContestJudgeEntry = (contestId: string, judgeId: any) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.findById(contestId)
			.then((contest: ContestModel) => {
				if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					ContestSchemaModel.aggregate([
						{ $match: { _id: Types.ObjectId(contestId), isDraft: false } },
						{ $unwind: '$entries' },
						{ $lookup: {from: 'users', localField: 'entries.contestant', foreignField: '_id', as: 'entries.contestant'} },
						{ $sort: { 'entries.createdAt': -1 } },
						{
							$project: {
								_id: '$entries._id',
								title: '$entries.title',
								contest: '$entries.contest',
								contestant: '$entries.contestant',
								descriptionDesign: '$entries.descriptionDesign',
								descriptionFunctionality: '$entries.descriptionFunctionality',
								descriptionUsability: '$entries.descriptionUsability',
								descriptionMarketPotential: '$entries.descriptionMarketPotential',
								isDraft: '$entries.isDraft',
								featuredImageUrl: '$entries.featuredImageUrl',
								attachments: '$entries.attachments',
								ratings: '$entries.ratings',
								createdAt: '$entries.createdAt',
								updatedAt: '$entries.updatedAt'
							}
						}
					]).then(async (entries: EntryModel[]) => {
						const contestantIds = []
						let contestantEntries = []
						
						const nonDraftEntries = entries.filter(e => !e.isDraft)
						nonDraftEntries.map(e => {
							if (contestantIds.indexOf(e.contestant.toString()) === -1) { contestantIds.push(e.contestant.toString()) }
						})
						
						contestantIds.map(contestantId => {
							const latestEntries = entries.filter(entry => entry.contestant.toString() === contestantId)
							contestantEntries.push(latestEntries[0])
						})
						
						contestantEntries = contestantEntries.map((entry: EntryModel) => {
							const myRating = entry.ratings.find(r => r.judge.toString() === judgeId)
							const entryContestant = entry.contestant as any
							
							return {
								...entry,
								contestant: entryContestant.length > 0 ?
									fillRawUserModel(filterObject(entryContestant[0], USER_POPULATE_SELECT_ARRAY)) : entryContestant,
								rating: calculateAvgRating(entry),
								myRating: calculateAvgSingleRating(myRating)
							}
						})
						
						resolve(contestantEntries)
					}).catch((error: any) => {
						reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
					})
				}
			}).catch((error: any) => {
				reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
		})
	})
}

/**
 * Update a contest entry
 *
 * @param entryId
 * @param userId
 * @param bodyData
 */
export const updateContestEntry = (entryId: string, userId: string, bodyData: any) => {
	return new Promise((resolve, reject) => {
		const updateKeys = ['title', 'descriptionDesign', 'descriptionFunctionality', 'descriptionUsability',
			'descriptionMarketPotential', 'attachments', 'isDraft' ]
		
		const updatedObject = {}
		updateKeys.forEach((uk) => {
			if (bodyData.hasOwnProperty(uk)) {
				updatedObject['entries.$.' + uk] = bodyData[uk]
			}
		})
		
		ContestSchemaModel.findOneAndUpdate({ 'entries._id': entryId }, { $set: updatedObject }, { new: true })
			.then((contest: ContestModel) => {
				if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
				const foundEntry = contest.entries.filter((entry) => entry._id.toString() === entryId )
					 resolve(foundEntry[0]) }
			}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Insert contest entry attachments
 *
 * @param entryId
 * @param newAttachment
 */
export const putEntryAttachments = (entryId: string, newAttachment: any) => {
	return new Promise<EntryAttachmentRecord[]>((resolve, reject) => {
		ContestSchemaModel.findOneAndUpdate({ 'entries._id': Types.ObjectId(entryId) },
			{ $push: { 'entries.$.attachments': newAttachment } }, { new: true })
			.then((contest: ContestModel) => {
				if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					const foundEntry = contest.entries.find(entry => entry._id.toString() === entryId)
					if (!foundEntry) { resolve([]) } else { resolve(foundEntry.attachments) }
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Update entry attachments
 *
 * @param contestantId
 * @param attachmentId
 * @param entryId
 * @param bodyData
 */
export const updateAttachments = (contestantId: number, attachmentId: string, entryId: string, bodyData: any) => {
	return new Promise<EntryAttachmentRecord>((resolve, reject) => {
		const updateKeys = ['title', 'caption', 'previewUrl', 'fileType']
		const updatedObject = {}

		updateKeys.forEach((uk) => {
			if (bodyData.hasOwnProperty(uk)) {
				updatedObject['entries.$[i].attachments.$[j].' + uk] = bodyData[uk]
			}
		})

		const options = {
			new: true,
			returnNewDocument: true,
			arrayFilters: [{ 'i._id': Types.ObjectId(entryId) }, { 'j._id': Types.ObjectId(attachmentId) }]
		}
		
		ContestSchemaModel.findOneAndUpdate({
			'entries.contestant': contestantId,
			'entries._id': Types.ObjectId(entryId),
			'entries.attachments._id': Types.ObjectId(attachmentId)
		}, { $set: updatedObject }, options)
			.then((contest: ContestModel) => {
				if (!contest) { reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE)) } else {
					const foundEntry = contest.entries.find(entry => entry._id.toString() === entryId)
					if (!foundEntry) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
						const attachment = foundEntry.attachments.find(attach => attach._id.toString()  === attachmentId)
						if (!attachment) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
							resolve(attachment)
						}
					}
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * Add entry rating
 *
 * @param judgeId
 * @param entryId
 * @param newRating
 */
export const putEntryRating = (judgeId: number, entryId: string, newRating: any) => {
	return new Promise ((resolve, reject) => {
		const ratingData = Object.assign({ judge: judgeId }, newRating)

		ContestSchemaModel.aggregate([
			{$unwind: '$entries'},

			{
			$match: {
				'entries._id': Types.ObjectId(entryId)
			}
		},
			{
				$project: {

					_id: '$entries._id',
					contestantId: '$entries.contestant',
					contest: '$_id',
					title: '$entries.title',
					descriptionDesign: '$entries.descriptionDesign',
					descriptionFunctionality: '$entries.descriptionFunctionality',
					descriptionUsability: '$entries.descriptionUsability',
					descriptionMarketPotential: '$entries.descriptionMarketPotential',
					attachments: '$entries.attachments',
					ratings: '$entries.ratings',
					createdAt: '$entries.createdAt',
					updatedAt: '$entries.updatedAt'
				}
			}
		]).then(  (foundEntry: any) => {
			if (foundEntry.length === 0) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
				const foundJudgeRating = foundEntry[0].ratings.filter(r => r.judge.toString() === judgeId)
				if (foundJudgeRating.length !== 0 ) { reject(new HubbersBaseError(HBE005_ALREADY_EXISTS)) } else {
					ContestSchemaModel.findOneAndUpdate({
							'entries._id': Types.ObjectId(entryId)
						},
						{
							$push: {
								'entries.$.ratings': ratingData
							}
						}, {
							new: true
						}
					).populate('ratings.conversation').then( (contest: any) => {
						if (!contest) {
							reject(new HubbersBaseError(HBE040_NOT_FOUND))
						} else {
							const getEntry = contest.entries.filter( entries => {

								return entries._id.toString() === entryId
							})
							const getRating = getEntry[0].ratings.filter(rat => rat.judge.toString()  === judgeId)
							const entry = {
								_id: getEntry[0]._id,
								contest: contest._id,
								title: getEntry[0].title,
								descriptionDesign: getEntry[0].descriptionDesign,
								descriptionFunctionality: getEntry[0].descriptionFunctionality,
								descriptionUsability: getEntry[0].descriptionUsability,
								descriptionMarketPotential: getEntry[0].descriptionMarketPotential,
								attachments: getEntry[0].attachments,
								ratings: getRating
							}
							resolve(entry)
						}
					}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
				}
			}
		}).catch((error: any) => reject(new HubbersBaseError( error)))
	})
}

/*
*  update entry Rating
*/
export const updateRating = (judgeId: number, ratingId: string, entryId: string, bodyData: any) => {
	return new Promise< any >((resolve, reject) => {
		const updateKeys = ['design', 'designComment', 'functionality', 'functionalityComment',
			'usability', 'usabilityComment', 'marketPotential', 'marketPotentialComment', 'isSeen']
		const updatedObject = {}

		updateKeys.forEach((uk) => {
			if (bodyData.hasOwnProperty(uk)) {
				updatedObject['entries.$[i].ratings.$[j].' + uk] = bodyData[uk]
			}
		})
		const update = {
			$set: updatedObject

		}
		const options = {
			new: true,
			arrayFilters: [{
				'i._id': Types.ObjectId(entryId)
			},
				{
					'j._id': Types.ObjectId(ratingId)
				}
			]
		}

		ContestSchemaModel.findOneAndUpdate({
			'entries._id': Types.ObjectId(entryId),
			'entries.ratings._id': Types.ObjectId(ratingId)
		}, update, options)
			.then((contest: ContestModel) => {
				if (!contest) {
					reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE))
				} else {

					const getEntry = contest.entries.filter( entries => {

						return entries._id.toString() === entryId
					})
					const getRating = getEntry[0].ratings.filter(rat => {
						return rat._id.toString()  === ratingId
					})
					const entry = {
						_id: getEntry[0]._id,
						contest: contest._id,
						title: getEntry[0].title,
						descriptionDesign: getEntry[0].descriptionDesign,
						descriptionFunctionality: getEntry[0].descriptionFunctionality,
						descriptionUsability: getEntry[0].descriptionUsability,
						descriptionMarketPotential: getEntry[0].descriptionMarketPotential,
						attachments: getEntry[0].attachments,
						ratings: getRating
					}
					resolve(entry)
				}

			}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))

	})
}

/*
*admin get all entries
*
*/
export const fetchAllEntries = (contestId: string) => {
	return new Promise< ContestModel[] >((resolve, reject) => {
		// ContestSchemaModel.find({_id: contestId}
		// ).sort({'entries.createdAt': -1}).then(async (contest: ContestModel[]) => {
		// 	if (contest.length === 0 ) {
		// 		reject(new HubbersBaseError(HBE040_NOT_FOUND))
		// 	} else {
		// 		const entries = contest[0].entries
		// 		const uniqueContestantIds = []
		// 		const uniqueEntries = []
		// 		entries.map(e => {
		// 			if (uniqueContestantIds.indexOf(e.contestant) === -1) { uniqueContestantIds.push(e.contestant) }
		// 		})
		// 		const uniqueContestantInfo = await getContestantInfo(uniqueContestantIds)
		//
		// 		const allEntries = entries.map((latestEntry: any) => {
		// 			let designAvgRating = 0
		// 			let functionalityAvgRating = 0
		// 			let usabilityAvgRating = 0
		// 			let marketPotentialAvgRating = 0
		//
		// 			latestEntry.ratings.map(rat => {
		// 				designAvgRating += rat.design
		// 				functionalityAvgRating += rat.functionality
		// 				usabilityAvgRating += rat.usability
		// 				marketPotentialAvgRating += rat.marketPotential
		// 			})
		//
		// 			const allRatings = {
		// 				design: designAvgRating / latestEntry.ratings.length,
		// 				functionality: functionalityAvgRating / latestEntry.ratings.length,
		// 				usability: usabilityAvgRating / latestEntry.ratings.length,
		// 				marketPotential: marketPotentialAvgRating / latestEntry.ratings.length
		// 			}
		//
		// 			const rating = {
		// 				average: (allRatings.design + allRatings.functionality + allRatings.usability
		// 					+ allRatings.marketPotential) / 4, ...allRatings
		// 			}
		// 			// Get contestant data
		// 			const contestantData = uniqueContestantInfo.find(c => c.id === latestEntry.contestant)
		// 			const contestant = {
		// 				id: contestantData.id,
		// 				name: contestantData.name,
		// 				lastName: contestantData.last_name,
		// 				fullName: contestantData.name + ' ' + contestantData.last_name,
		// 				thumbnailImageUrl: contestantData.thumbnail_image_url
		// 			}
		// 			return { ...latestEntry.toObject(), rating, contestant}
		//
		// 		})
		// 		resolve(allEntries) }
		// }).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/*
*admin get entries by contestantId
*
*/
export const fetchEntriesByContestantId = (contestId: string, contestantId: any) => {
	return new Promise < ContestModel > ((resolve, reject) => {
		// ContestSchemaModel.findOne({ _id: contestId })
		// 	.then((contest: ContestModel) => {
		// 		if (contest) {
		// 			ContestSchemaModel.aggregate([{
		// 				$unwind: '$entries'
		// 			},
		// 				{
		//
		// 					$match: {
		// 						'_id': contestId,
		// 						'entries.contestant': parseInt(contestantId, 10)
		// 					}
		// 				},
		// 				{
		// 					$project: {
		// 						contestants: '$contestants',
		// 						judges: '$judges',
		// 						_id: '$entries._id',
		// 						title: '$entries.title',
		// 						contestantId: '$entries.contestant',
		// 						descriptionDesign: '$entries.descriptionDesign',
		// 						descriptionFunctionality: '$entries.descriptionFunctionality',
		// 						descriptionUsability: '$entries.descriptionUsability',
		// 						descriptionMarketPotential: '$entries.descriptionMarketPotential',
		// 						isDraft: '$entries.isDraft',
		// 						attachments: '$entries.attachments',
		// 						ratings: '$entries.ratings'
		// 					}
		// 				}
		// 			]).then(async (entries: any) => {
		// 				if (entries.length === 0) {
		// 					resolve(entries)
		// 				} else {
		// 					const uniqueContestantIds = []
		// 					entries.map(e => {
		// 						if (uniqueContestantIds.indexOf(e.contestant) === -1) { uniqueContestantIds.push(e.contestant) }
		// 					})
		// 					const uniqueContestantInfo = await getContestantInfo(uniqueContestantIds)
		// 					const entryiesAvgMarks = entries.map(latestEntry => {
		// 						let designAvgRating = 0
		// 						let functionalityAvgRating = 0
		// 						let usabilityAvgRating = 0
		// 						let marketPotentialAvgRating = 0
		//
		// 						latestEntry.ratings.map( rat => {
		// 							designAvgRating += rat.design
		// 							functionalityAvgRating += rat.functionality
		// 							usabilityAvgRating += rat.usability
		// 							marketPotentialAvgRating += rat.marketPotential
		// 						})
		//
		// 						const judgeRatings = {
		// 							design: designAvgRating / latestEntry.ratings.length,
		// 							functionality: functionalityAvgRating / latestEntry.ratings.length,
		// 							usability: usabilityAvgRating / latestEntry.ratings.length,
		// 							marketPotential: marketPotentialAvgRating / latestEntry.ratings.length
		// 						}
		// 						const avgRat =	{ average: (judgeRatings.design + judgeRatings.functionality
		// 								+ judgeRatings.usability + judgeRatings.marketPotential) / 4 }
		//
		// 						const rating = Object.assign(avgRat, judgeRatings)
		// 						let countJudgeRating: number = 0
		//
		// 						const arr = []
		// 						latestEntry.judges.map((uj, index) => {
		// 							const check =  latestEntry.ratings.filter(jk =>  jk.judgeId === uj.id )
		// 							if (check.length !== 0) {
		// 								arr.push(check)
		// 								countJudgeRating = arr.length
		// 							}
		// 						})
		// 						const newEntry = {
		// 							_id: latestEntry._id,
		// 							title: latestEntry.title,
		// 							contestantId: latestEntry.contestant,
		// 							descriptionDesign:  latestEntry.descriptionDesign,
		// 							descriptionFunctionality: latestEntry.descriptionFunctionality,
		// 							descriptionUsability: latestEntry.descriptionUsability,
		// 							descriptionMarketPotential: latestEntry.descriptionMarketPotential,
		// 							isDraft: latestEntry.isDraft,
		// 							attachments: latestEntry.attachments,
		// 							ratings: latestEntry.ratings
		// 						}
		// 						return { ...newEntry, numContestants: contest.numContestants,
		// 							marksGiven: countJudgeRating, contestant: uniqueContestantInfo[0], rating  }
		//
		// 					})
		//
		// 					resolve(entryiesAvgMarks)
		// 				}
		// 			}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
		// 		} else {
		// 			reject(new HubbersBaseError(HBE040_NOT_FOUND))
		// 		}
		//
		// 	}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/*
* admin get single entries by judgeId
*
*/
export const fetchEntriesByJudgeId = (contestId: string, judgeId: number) => {
	return new Promise((resolve, reject) => {
	// 	ContestSchemaModel.aggregate([{
	// 		$match: { _id: contestId }
	// 	},
	// 		{$unwind: '$entries'},
	// 		{$sort: {'entries.createdAt': -1}},
	// 		{
	// 			$project: {
	// 				_id: '$entries._id',
	// 				contestantId: '$entries.contestant',
	// 				contest: '$entries.contest',
	// 				title: '$entries.title',
	// 				descriptionDesign: '$entries.descriptionDesign',
	// 				descriptionFunctionality: '$entries.descriptionFunctionality',
	// 				descriptionUsability: '$entries.descriptionUsability',
	// 				descriptionMarketPotential: '$entries.descriptionMarketPotential',
	// 				attachments: '$entries.attachments',
	// 				ratings: '$entries.ratings',
	// 				createdAt: '$entries.createdAt',
	// 				updatedAt: '$entries.updatedAt'
	// 			}
	// 		}
	// 	]).then(async (entries: EntryModel[]) => {
	// 		if (entries.length === 0) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
	// 			// Sort unique entries by contestants
	// 			const uniqueContestantIds = []
	// 			const uniqueEntries = []
	// 			entries.map(e => {
	// 				if (uniqueContestantIds.indexOf(e.contestant) === -1) { uniqueContestantIds.push(e.contestant) }
	// 			})
	// 			const uniqueContestantInfo = await getContestantInfo(uniqueContestantIds)
	//
	// 			uniqueContestantIds.map((contestantId: string) => {
	// 				// const latestEntry = entries.find(e => e.contestant === contestantId)
	// 				const latestEntries = entries.filter((entry: EntryModel) =>
	// 					entry.contestant.toString() === contestantId && !entry.isDraft)
	// 				// const latestEntry = latestEntries[latestEntries.length - 1]
	// 				const latestEntry = latestEntries[0]
	//
	// 				let myRating = latestEntry.ratings.find((r) => r.judgeId === Number(judgeId))
	// 				// Calculate average judge ratings
	// 				if (typeof (myRating) !== 'undefined' ) {
	// 					myRating.average =
		// 					(myRating.design + myRating.functionality + myRating.usability + myRating.marketPotential) / 4
	// 				} else {
	// 					myRating = null
	// 				}
	//
	// 				// Average Rating
	// 				let designAvgRating = 0
	// 				let functionalityAvgRating = 0
	// 				let usabilityAvgRating = 0
	// 				let marketPotentialAvgRating = 0
	//
	// 				latestEntry.ratings.map(rat => {
	// 					designAvgRating += rat.design
	// 					functionalityAvgRating += rat.functionality
	// 					usabilityAvgRating += rat.usability
	// 					marketPotentialAvgRating += rat.marketPotential
	// 				})
	//
	// 				const allRatings = {
	// 					design: designAvgRating / latestEntry.ratings.length,
	// 					functionality: functionalityAvgRating / latestEntry.ratings.length,
	// 					usability: usabilityAvgRating / latestEntry.ratings.length,
	// 					marketPotential: marketPotentialAvgRating / latestEntry.ratings.length
	// 				}
	//
	// 				const rating = {
	// 					average: (allRatings.design + allRatings.functionality + allRatings.usability
	// 						+ allRatings.marketPotential) / 4, ...allRatings
	// 				}
	//
	// 				// Get contestant data
	// 				let contestant
	// 				if (uniqueContestantInfo.length > 0) {
	// 					const contestantData = uniqueContestantInfo.find(c => c.id === latestEntry.contestant)
	// 					contestant = {
	// 							id: contestantData.id,
	// 							name: contestantData.name,
	// 							lastName: contestantData.last_name,
	// 							fullName: contestantData.name + ' ' + contestantData.last_name,
	// 							thumbnailImageUrl: contestantData.thumbnail_image_url
	// 						}
	// 				} else { contestant = {}  }
	//
	// 				uniqueEntries.push({ ...latestEntry, contestant, rating, myRating})
	// 			})
	//
	// 			resolve(uniqueEntries)
	// 		}
	// 	}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}
/*
*   admin fetch contest entry
* */
export const adminFetchSingleContestEntry = ( entryId: string) => {
	return new Promise< any >((resolve, reject) => {
		// ContestSchemaModel.find({ 'entries._id': Types.ObjectId(entryId)
		// }).then(async (contest: ContestModel[]) => {
		// 	if (contest.length === 0 ) {
		// 		resolve(contest)
		// 	} else {
		//
		// 		const foundEntry = contest[0].entries
		// 		const entryResponse =  foundEntry.filter(entry => entry._id.toString()  === entryId )
		// 		const users = await LegacyDb.select(USER_SELECT).from('users').where('id', entryResponse[0].contestant).first()
		//
		// 		const userData = {
		// 			name: users.name,
		// 			lastName: users.last_name,
		// 			fullName: users.name + ' ' + users.last_name,
		// 			thumbnailImageUrl: users.thumbnail_image_url
		// 		}
		// 		let designAvgRating = 0
		// 		let functionalityAvgRating = 0
		// 		let usabilityAvgRating = 0
		// 		let marketPotentialAvgRating = 0
		// 		entryResponse[0].ratings.map( rat => {
		// 			designAvgRating += rat.design
		// 			functionalityAvgRating += rat.functionality
		// 			usabilityAvgRating += rat.usability
		// 			marketPotentialAvgRating += rat.marketPotential
		// 		})
		// 		const judgeRatings = {
		// 			design: designAvgRating / entryResponse[0].ratings.length,
		// 			functionality: functionalityAvgRating / entryResponse[0].ratings.length,
		// 			usability: usabilityAvgRating / entryResponse[0].ratings.length,
		// 			marketPotential: marketPotentialAvgRating / entryResponse[0].ratings.length
		// 		}
		// 		const avgRat =	{ average: (judgeRatings.design + judgeRatings.functionality
		// 				+ judgeRatings.usability + judgeRatings.marketPotential) / 4 }
		// 		const rating = {...avgRat, ...judgeRatings}
		//
		// 		const entryResponseData =  entryResponse[0]
		// 		const judgeIds = entryResponseData.ratings.map((r: any ) => r.judgeId)
		// 		const judgeData = await fetchJudgeFromUserIds(judgeIds)
		//
		// 		const ratingData = entryResponseData.ratings.map((r: any) => {
		// 			return {...r.toObject(), judgeInfo: judgeData[r.judgeId] }
		// 		})
		// 		const latestEntry = {
		// 			_id: entryResponseData._id,
		// 			contestantId: entryResponseData.contestant,
		// 			contest: entryResponseData.contest,
		// 			title: entryResponseData.title,
		// 			descriptionDesign: entryResponseData.descriptionDesign,
		// 			descriptionFunctionality: entryResponseData.descriptionFunctionality,
		// 			descriptionUsability: entryResponseData.descriptionUsability,
		// 			descriptionMarketPotential: entryResponseData.descriptionMarketPotential,
		// 			ratings: ratingData,
		// 			attachments: entryResponseData.attachments,
		// 			isDraft: entryResponseData.isDraft
		// 		}
		// 		const entryAvgRating = { rating, ...latestEntry, contestant: userData}
		//
		// 		resolve(entryAvgRating)
		// 	}
		// }).catch((error: any) => reject(new HubbersBaseError( error)))
	})
}

/*
* update contest entry using patch method
* */

export const adminUpdateContestEntry = (entryId: string, bodyData: any) => {
	return new Promise((resolve, reject) => {

		const updateKeys = ['title', 'descriptionDesign',
			'descriptionFunctionality', 'descriptionUsability', 'descriptionMarketPotential', 'isDraft'
		]
		const updatedObject = {}

		updateKeys.forEach((uk) => {
			if (bodyData.hasOwnProperty(uk)) {
				updatedObject['entries.$.' + uk] = bodyData[uk]
			}
		})

		ContestSchemaModel.findOneAndUpdate({
			'entries._id': Types.ObjectId(entryId)
		}, {
			$set: updatedObject
		}, { new: true
		})
			.then((contest: any) => {
				if (!contest) {
					reject(new HubbersBaseError(HBE040_NOT_FOUND))
				} else {
					const getEntry =  contest.entries.filter(entry =>  {
						return entry._id.toString() === entryId
					})
					resolve(getEntry)
				}

			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))

	})
}

/*
*  ADMIN update entry attachments
*/
export const adminUpdateAttachments = (attachmentId: string, entryId: string, bodyData: any) => {
	return new Promise< ContestModel >((resolve, reject) => {
		const updateKeys = ['title', 'caption', 'previewUrl', 'fileType']
		const updatedObject = {}

		updateKeys.forEach((uk) => {
			if (bodyData.hasOwnProperty(uk)) {
				updatedObject['entries.$[i].attachments.$[j].' + uk] = bodyData[uk]
			}
		})
		const update = {
			$set: updatedObject

		}
		const options = {
			new: true,
			arrayFilters: [{
				'i._id': Types.ObjectId(entryId)
			},
				{
					'j._id': Types.ObjectId(attachmentId)
				}
			]
		}

		ContestSchemaModel.findOneAndUpdate({
			'entries._id': Types.ObjectId(entryId),
			'entries.attachments._id': Types.ObjectId(attachmentId)
		}, update, options)
			.then((contest: ContestModel) => {
				if (!contest) {
					reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE))
				} else {
					const getEntry = contest.entries.filter( entry => {

						return entry._id.toString() === entryId
					})
					const attachment = getEntry[0].attachments.filter(attach => {
						return attach._id.toString()  === attachmentId
					})
					resolve(attachment)
				}

			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))

	})
}

/**
 * Admin remove Entry Rating
 *
 * @param entryId
 * @param ratingId
 */
export const adminRemoveRating = (entryId: string, ratingId: string) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.findOne({ 'entries._id': Types.ObjectId(entryId) })
			.then((contest: ContestModel) => {
				if (!contest) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					ContestSchemaModel.update(
						{'entries.ratings._id': Types.ObjectId(ratingId)},
						{$pull: {'entries.$.ratings': {_id: Types.ObjectId(ratingId)}}
						}).then((rating: any) => resolve(rating)
					).catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
				}
			}).catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
	})
}

/**
 * Admin remove Entry
 *
 * @param entryId
 */
export const adminRemoveEntry = (entryId: string) => {
	return new Promise<ContestModel>((resolve, reject) => {
		ContestSchemaModel.update({ 'entries._id': Types.ObjectId(entryId) },
			{$pull: {entries: {_id: Types.ObjectId(entryId)}}
			}).then((contest: ContestModel) => resolve(contest)
		).catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
	})
}

// Helper Functions
export const calculateAvgRating = (entry: EntryModel) => {
	// Calculate average rating for the entry
	let designAvgRating = 0
	let functionalityAvgRating = 0
	let usabilityAvgRating = 0
	let marketPotentialAvgRating = 0
	
	entry.ratings.map( rat => {
		designAvgRating += rat.design
		functionalityAvgRating += rat.functionality
		usabilityAvgRating += rat.usability
		marketPotentialAvgRating += rat.marketPotential
	})
	
	const entryRatings = {
		design: designAvgRating / entry.ratings.length || 0,
		functionality: functionalityAvgRating / entry.ratings.length || 0,
		usability: usabilityAvgRating / entry.ratings.length || 0,
		marketPotential: marketPotentialAvgRating / entry.ratings.length || 0
	}
	
	return { average: (entryRatings.design + entryRatings.functionality +
			entryRatings.usability + entryRatings.marketPotential) / 4, ...entryRatings }
}

export const calculateAvgSingleRating = (rating) => {
	if (rating) {
		rating = {...rating.toObject(),
			average: (rating.design + rating.functionality + rating.usability + rating.marketPotential) / 4}
	} else {
		rating = null
	}
	
	return rating
}