import axios from 'axios'
import { Types } from 'mongoose'

import {
	HBE003_FAILED_TO_FETCH,
	HBE004_FAILED_TO_CREATE,
	HBE005_ALREADY_EXISTS,
	HBE006_FAILED_TO_UPDATE,
	HBE007_FAILED_TO_DELETE,
	HBE017_NOT_AUTHORIZED,
	HBE040_NOT_FOUND
} from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { ExpertiseCategoryRecord } from '../interfaces/expertise'
import { ConversationSchemaModel } from '../models/conversation'
import { ExpertiseModel, ExpertiseSchemaModel } from '../models/expertise'
import { ExpertiseCategoryModel, ExpertiseCategorySchemaModel } from '../models/expertiseCategory'
import { ExpertiseOrderModel, ExpertiseOrderSchemaModel } from '../models/expertiseOrder'
import { UserModel, UserSchemaModel } from '../models/user'
import { slugify } from '../utils/stringUtils'

/**
 * Fetch an expertise by its short id
 *
 * @param {string} shortId
 * @param userId
 * @returns {Promise<ExpertiseModel>}
 */
export const fetchExpertiseByShortId = (shortId: string, userId?: string) => {
	return new Promise<ExpertiseModel>((resolve, reject) => {
		const filterCondition = userId ? { shortId } : { shortId, isDraft: false }
		ExpertiseSchemaModel.findOne(filterCondition)
			.populate('user')
			.then(async (foundExpertise) => {
				if (userId && ((foundExpertise.user as UserModel)._id.toString()
					&& userId !== (foundExpertise.user as UserModel)._id.toString())) {
					reject(new HubbersBaseError(HBE017_NOT_AUTHORIZED))
				} else {
					if (!foundExpertise) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
						try {
							resolve({ ...foundExpertise.toObject() })
						} catch (error) {
							reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
						}
					}
				}
			}).catch((error) => { reject(new HubbersBaseError(HBE040_NOT_FOUND, error)) })
	})
}

/**
 * Admin Fetch an expertise by its short id
 *
 */
export const adminFetchExpertiseByShortId = (shortIds: string) => {
	return new Promise<any>((resolve, reject) => {
		ExpertiseSchemaModel.findOne({ shortId: shortIds })
			.populate('user').then(async (foundExpertise) => {
				// resolve(await attachSingleExpertMetadataToExpertise(foundExpertise))
				resolve(foundExpertise)
			}).catch((error) => { reject(new HubbersBaseError(HBE040_NOT_FOUND, error)) })
	})
}

/**
 * Admin Update an expertise
 *
 */
export const adminUpdateExpertise = (expertiseId: string, updatedExpertise: any) => {
	return new Promise<ExpertiseModel>(async (resolve, reject) => {
		return ExpertiseSchemaModel.findOneAndUpdate({ _id: expertiseId }, updatedExpertise,
			/* tslint:disable */
			{ 'new': true } /* tslint:enable */)
			.then((expertise: ExpertiseModel) => resolve(expertise))
			.catch((error: any) => { reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)) })
	})
}

export const fetchExpertiseByIds = (ids: string[]) => {
	return new Promise<ReadonlyArray<ExpertiseModel>>((resolve, reject) => {
		ExpertiseSchemaModel.find({ _id: { $in: ids.map(id => Types.ObjectId(id)) } })
			.populate('user').populate('category')
			.then(async (foundExpertise) => {
				if (!foundExpertise) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					try {
						resolve(foundExpertise)
					} catch (error) {
						reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH))
					}
				}
			}).catch((error) => { reject(new HubbersBaseError(HBE040_NOT_FOUND, error)) })
	})
}

export const fetchExpertiseByTags = (tags: [string], categoryId: string) => {
	return new Promise<ReadonlyArray<ExpertiseModel>>((resolve, reject) => {
		const expertiseFilter = categoryId ? { category: categoryId } : {}
	
		ExpertiseSchemaModel.find({ ...expertiseFilter, isDraft: false })
			.populate('user').populate('category')
			.then(async (expertise: [ExpertiseModel]) => {
				if (tags.length > 0 && tags[0] !== 'all') {
					resolve(await sortExpertiseByTags(expertise, tags))
				} else if (tags.length === 1 && tags[0] === 'all') {
					resolve(expertise)
				} else {
					resolve([])
				}
			})
			.catch((error) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

/*
* admin fetch all expertise
* */
export const fetchAllExpertise = () => {
	return new Promise<ReadonlyArray<ExpertiseModel>>((resolve, reject) => {
		ExpertiseSchemaModel.find({}).populate('user').populate('categorylocation ')
			.then(async (expertise: ExpertiseModel[]) => {
				// resolve(await attachExpertMetadataToExpertise(expertise))
				resolve(expertise)
			})
			.catch((error) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

/*
*  fetch expertise Reviews
* */
export const fetchExpertiseReview = (expertiseId) => {
	return new Promise<any>((resolve, reject) => {
		ExpertiseSchemaModel.find({ _id: Types.ObjectId(expertiseId) })
			.populate('reviews.user').then(async (expertise: any) => {
				// resolve(await attachReviewMeataData(expertise))
				resolve(expertise[0].reviews)
			})
			.catch((error) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

/*
*  admin fetch expertise Reviews
* */
export const adminFetchExpertiseReview = (expertiseId) => {
	return new Promise<any>((resolve, reject) => {
		ExpertiseSchemaModel.find({ _id: Types.ObjectId(expertiseId) }).populate({path: 'reviews.user'})
			.then(async (expertise: any) => {
				resolve(expertise[0].reviews)
				// resolve(await attachReviewMeataData(expertise))
			})
			.catch((error) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

/*
*  fetch expertise Reviews
* */
export const fetchExpertiseSingleReview = (expertiseId, reviewId) => {
	return new Promise<any>((resolve, reject) => {
		ExpertiseSchemaModel.find({ _id: Types.ObjectId(expertiseId) }).populate('reviews.user')
			.then(async (expertise: any) => {

				const foundReview = expertise[0].reviews.filter(r => r._id.toString() === reviewId)
				resolve(foundReview[0])
			})
			.catch((error) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

/*
*  admin fetch expertise Reviews
* */
export const adminFetchExpertiseSingleReview = (expertiseId, reviewId) => {
	return new Promise<any>((resolve, reject) => {
		ExpertiseSchemaModel.find({ _id: Types.ObjectId(expertiseId) }).populate('reviews.user')
			.then(async (expertise: any) => {

				const foundReview = expertise[0].reviews.filter(r => r._id.toString() === reviewId)
				resolve(foundReview[0])
			})
			.catch((error) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

/*
*  fetch expertise order
*
* */
export const fetchExpertiseOrder = (expertiseId: string, userId: string) => {
	return new Promise<ExpertiseOrderModel>((resolve, reject) => {
		ExpertiseOrderSchemaModel.findOne(
			{ expertise: Types.ObjectId(expertiseId), user: userId, completed: false })
			.then((foundExpertiseOrder: ExpertiseOrderModel) => {
				if (foundExpertiseOrder) { resolve(foundExpertiseOrder) } else { reject(new HubbersBaseError(HBE040_NOT_FOUND)) }
			}).catch((error) => { reject(new HubbersBaseError(HBE040_NOT_FOUND, error)) })
	})
}

/*
* update exoertise review
* */

export const updateExpertiseReview = (expertiseId: string, reviewId: string, updatedExpertise: any) => {
	return new Promise<any>((resolve, reject) => {
		const updateKeys = ['rating', 'body']
		const updatedObject = {}

		updateKeys.forEach((uk) => {
			if (updatedExpertise.hasOwnProperty(uk)) {
				updatedObject['reviews.$.' + uk] = updatedExpertise[uk]
			}
		})
		ExpertiseSchemaModel.findOneAndUpdate(
			{ '_id': Types.ObjectId(expertiseId), 'reviews._id': Types.ObjectId(reviewId) },
			{
				$set: updatedObject
			},
			{
				new: true
			}).then((updateReview: any) => {

				if (updateReview) {
					resolve(updateReview)
				} else {
					reject(new HubbersBaseError(HBE040_NOT_FOUND))
				}
			}).catch((error) => {
				reject(new HubbersBaseError(error))
			})
	})
}

/*
*  admin update exoertise review
* */

export const adminUpdateExpertiseReview = (expertiseId: string, reviewId: string, updatedExpertise: any) => {
	return new Promise<any>((resolve, reject) => {
		const updateKeys = ['rating', 'body']
		const updatedObject = {}

		updateKeys.forEach((uk) => {
			if (updatedExpertise.hasOwnProperty(uk)) {
				updatedObject['reviews.$.' + uk] = updatedExpertise[uk]
			}
		})
		ExpertiseSchemaModel.findOneAndUpdate(
			{ '_id': Types.ObjectId(expertiseId), 'reviews._id': Types.ObjectId(reviewId) },
			{
				$set: updatedObject
			},
			{
				new: true
			}).then((updateReview: any) => {

				if (updateReview) {
					resolve(updateReview)
				} else {
					reject(new HubbersBaseError(HBE040_NOT_FOUND))
				}
			}).catch((error) => {
				reject(new HubbersBaseError(error))
			})
	})
}

/*
*  Remove expertise Review
*
* */
export const removeExpertiseReview = (expertiseId: string, reviewId: string) => {
	return new Promise((resolve, reject) => {
		ExpertiseSchemaModel.update({ '_id': Types.ObjectId(expertiseId), 'reviews._id': Types.ObjectId(reviewId) },
			{
				$pull: { reviews: { _id: Types.ObjectId(reviewId) } }
			}).then((updateReview: any) => {

				if (updateReview) {
					resolve(updateReview)
				} else {
					reject(new HubbersBaseError(HBE040_NOT_FOUND))
				}
			}).catch((error) => {
				reject(new HubbersBaseError(error))
			})
	})
}

/*
* Admin  Remove expertise Review
*
* */
export const adminRemoveExpertiseReview = (expertiseId: string, reviewId: string) => {
	return new Promise((resolve, reject) => {
		ExpertiseSchemaModel.update({ '_id': Types.ObjectId(expertiseId), 'reviews._id': Types.ObjectId(reviewId) },
			{
				$pull: { reviews: { _id: Types.ObjectId(reviewId) } }
			}).then((updateReview: any) => {

				if (updateReview) {
					resolve(updateReview)
				} else {
					reject(new HubbersBaseError(HBE040_NOT_FOUND))
				}
			}).catch((error) => {
				reject(new HubbersBaseError(error))
			})
	})
}

/**
 * Create an expertise by the user id
 *
 * 1. Fetch the expert by user id and
 * 2. Fetch all expertise any draft expertise not created by the expert
 *
 */
export const createExpertiseByUserId = (userId: string) => {
	return new Promise<ExpertiseModel>(async (resolve, reject) => {
		try {
			const user: UserModel = await UserSchemaModel.findOne({ _id: userId })

			if (user) {
				
				const draftExpertise = await ExpertiseSchemaModel.findOne(
					{ user: Types.ObjectId(user._id), isDraft: true })
					.populate('user').populate('category')

				if (draftExpertise) {
						resolve(draftExpertise)
					} else {
						let newExpertise = await ExpertiseSchemaModel.create({
							user: Types.ObjectId(user._id)
						})
		
						newExpertise = await newExpertise.populate('user').populate('category')
						resolve(newExpertise)
					}
					
			} else {
				reject(new HubbersBaseError(HBE040_NOT_FOUND))
			}
		} catch (error) {
			reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
		}
	})
}

/**
 * Admin Create an expertise by the user id
 *
 * 1. Fetch the expert by user id and
 * 2. Fetch all expertise any draft expertise not created by the expert
 *
 */
export const adminCreateExpertise = (postData: any) => {
	return new Promise<ExpertiseModel>(async (resolve, reject) => {
		try {
			const expertise = await ExpertiseSchemaModel.create(postData)
			resolve(expertise)

		} catch (error) {
			reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
		}
	})
}

/**
 * Create an expertise Review
 *
 * 1. Fetch the expert by user id and
 * 2. Fetch all expertise any draft expertise not created by the expert
 *
 */
export const createExpertiseReview = (expertiseId: string, reviewData: any, id: number) => {
	return new Promise<ExpertiseModel>(async (resolve, reject) => {
		const expertiseReviewData = Object.assign({ user: id }, reviewData)
		ExpertiseSchemaModel.findOneAndUpdate({ _id: Types.ObjectId(expertiseId) },
			{ $push: { reviews: expertiseReviewData } }, { new: true })
			.then((review: ExpertiseModel) => resolve(review))
			.catch((error) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}

/**
 * Create an expertise Review
 *
 * 1. Fetch the expert by user id and
 * 2. Fetch all expertise any draft expertise not created by the expert
 *
 */
export const adminCreateExpertiseReview = (expertiseId: string, reviewData: any, id: number) => {
	return new Promise<ExpertiseModel>(async (resolve, reject) => {
		const expertiseReviewData = Object.assign({ user: id }, reviewData)
		ExpertiseSchemaModel.findOneAndUpdate({ _id: Types.ObjectId(expertiseId) },
			{ $push: { reviews: expertiseReviewData } }, { new: true })
			.then((review: ExpertiseModel) => resolve(review))
			.catch((error) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}

/**
 * Update an expertise
 *
 */
export const updateExpertise = (expertiseId: string, updatedExpertise: any) => {
	return new Promise<ExpertiseModel>(async (resolve, reject) => {
		return ExpertiseSchemaModel.findOneAndUpdate({ _id: expertiseId }, updatedExpertise,
			/* tslint:disable */
			{ 'new': true } /* tslint:enable */)
			.then((expertise: ExpertiseModel) => resolve(expertise))
			.catch((error: any) => { reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)) })
	})
}
/*
*  Admin remove expertise
* */
export const removeExpertise = (expertiseId: string) => {
	return new Promise<ExpertiseModel>((resolve, reject) => {
		ExpertiseSchemaModel.findOneAndRemove({ _id: expertiseId })
			.then((expertise: ExpertiseModel) => {
				expertise ? resolve(expertise) : reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE))
			})
			.catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE)))
	})
}

/**
 * Sync Expertise Category
 */
export const syncExpertiseCategory = () => {
	return new Promise((resolve, reject) => {
		axios.get(process.env.EXPERTISE_API)
			.then(response => {
				const expertiseCategoryList: ReadonlyArray<ExpertiseCategoryRecord> = response.data.expertiseCategory
				if (!expertiseCategoryList) { reject() } else {
					Promise.all(expertiseCategoryList.map(async (e: ExpertiseCategoryModel) => {
						const condition = e._id !== '' ? { _id: Types.ObjectId(e._id) } : { name: e.name }
						delete e._id

						return await ExpertiseCategorySchemaModel.findOneAndUpdate(condition, { $set: {} },
							/* tslint:disable */
							{ upsert: true, 'new': true, setDefaultsOnInsert: true }) /* tslint:enable */
							.then((expertiseCategory: ExpertiseCategoryModel) => expertiseCategory._id)
					}))
						.then((expertiseCategoryIds: any) => { resolve(expertiseCategoryIds) })
						.catch((error: any) => reject(error))
				}
			})
	})
}

/**
 * Create an expertise order
 *
 * @param {number} userId
 * @param {string} projectId
 * @param {string} expertiseId
 * @param {string} selectedPackageId
 * @returns {Promise<ExpertiseOrderModel>}
 */
export const createExpertiseOrder =
	(userId: string, projectId: string, expertiseId: string, selectedPackageId: string) => {
	return new Promise<ExpertiseOrderModel>((resolve, reject) => {
		ExpertiseOrderSchemaModel.findOne(
			{ user: userId, project: Types.ObjectId(projectId), expertise: Types.ObjectId(expertiseId), completed: false })
			.then(async (foundExpertiseOrder) => {
				if (!foundExpertiseOrder) {
					const expertiseOrder = new ExpertiseOrderSchemaModel({
						user: userId, project: Types.ObjectId(projectId), expertise: Types.ObjectId(expertiseId),
						selectedPackage: Types.ObjectId(selectedPackageId)
					})

					let conversation = new ConversationSchemaModel({
						category: 'expertise', author: userId, participants: [userId]
					})
					conversation = await conversation.save()

					expertiseOrder.conversation = conversation._id
					expertiseOrder.save()
						.then(async (newExpertiseOrder: ExpertiseOrderModel) => {
							resolve(await newExpertiseOrder.populate('user'))
						})
						.catch((error) => { reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)) })
				} else { reject(new HubbersBaseError(HBE005_ALREADY_EXISTS)) }
			}).catch((error) => { reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)) })
	})
}

const sortExpertiseByTags = (expertise: any, tags: [string]) => {
	for (const expertiseItem of expertise) {
		expertiseItem.score = getScoreByTags(expertiseItem.tags, tags)
	}

	expertise = expertise.sort((a, b) => b.score - a.score)

	if (tags.length > 0) {
		expertise = expertise.filter(e => e.score > 0)
	}

	return expertise
}

const getScoreByTags = (expertiseTags: [string], tags: [string]): number => {
	let expertiseMatchScore: number = 0

	for (let iet = 0; iet < expertiseTags.length; iet++) {
		expertiseTags[iet] = slugify(expertiseTags[iet])

		for (let imt = 0; imt < tags.length; imt++) {
			const matchTag = slugify(tags[imt])

			if (matchTag === expertiseTags[iet]) {
				expertiseMatchScore += ((tags.length - (imt as number)) * (expertiseTags.length - (iet as number)))
			}
		}
	}

	return expertiseMatchScore
}