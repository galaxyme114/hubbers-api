import {
	HBE003_FAILED_TO_FETCH, HBE004_FAILED_TO_CREATE, HBE007_FAILED_TO_DELETE, HBE017_NOT_AUTHORIZED,
	HBE040_NOT_FOUND
} from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { BusinessNeedsModel, BusinessNeedsSchemaModel } from '../models/businessNeeds'
import { slugify } from '../utils/stringUtils'

export const fetchBusinessNeedsByTags = (tags: [string], categoryId: string) => {
	return new Promise<ReadonlyArray<BusinessNeedsModel>>((resolve, reject) => {
		const filter = categoryId ? { category: categoryId } : {}

		BusinessNeedsSchemaModel.find({ ...filter })
			.populate({ path: 'project', populate: { path: 'user' } }).populate('category').populate('user')
			.then(async (businessNeeds: BusinessNeedsModel[]) => {
				if (tags.length > 0 && tags[0] !== 'all') {
					// resolve(attachProjectMetadataToBusinessNeeds(sortBusinessNeedsByTags(businessNeeds, tags)))
					resolve(sortBusinessNeedsByTags(businessNeeds, tags))
				} else if (tags.length === 1 && tags[0] === 'all') {
					resolve(businessNeeds)

					// resolve(attachProjectMetadataToBusinessNeeds(businessNeeds))
				} else {
					resolve([])
				}
			})
			.catch((error) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

export const fetchBusinessNeedByShortId = (shortId: string) => {
	return new Promise<BusinessNeedsModel>((resolve, reject) => {
		BusinessNeedsSchemaModel.findOne({ shortId }) 
		.populate({ path: 'project', populate: { path: 'user' } }).populate('project').populate('category')
			.then(async (foundBusinessNeed) => {
				if (!foundBusinessNeed) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					// const updatedBusinessNeeds = await attachProjectMetadataToBusinessNeeds([foundBusinessNeed])
					resolve(foundBusinessNeed)
				}
			}).catch((error) => { reject(new HubbersBaseError(HBE040_NOT_FOUND, error)) })
	})
}

export const createBusinessNeed = (userId: string, businessNeedBody: any) => {
	return new Promise<BusinessNeedsModel>(async (resolve, reject) => {
		// TODO: Check for user ACL
		const isAuthorized = true

		try {
			// Create project on behalf of the user

			let businessNeed
			if (isAuthorized) {
				businessNeed = new BusinessNeedsSchemaModel({
					user: userId,
					project: businessNeedBody.projectId,
					category: businessNeedBody.categoryId,
					description: businessNeedBody.description,
					// tags: trimAll(businessNeedBody.tags.split(',')),
					budgetMin: businessNeedBody.budgetMin,
					budgetMax: businessNeedBody.budgetMax,
					geography: businessNeedBody.geography
				})
				await businessNeed.save().then((businessNeed1) => resolve(businessNeed1))
					.catch((error) => { reject(new HubbersBaseError(HBE040_NOT_FOUND, error)) })

			} else {
				reject(new HubbersBaseError(HBE017_NOT_AUTHORIZED))
			}
		} catch (error) {
			reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE))
		}
	})
}

export const removeBusinessNeed = (businessNeedId: string, userId: string) => {
	return new Promise<BusinessNeedsModel>((resolve, reject) => {
		BusinessNeedsSchemaModel.findOneAndRemove({ _id: businessNeedId, user: userId })
			.then((businessNeed: BusinessNeedsModel) =>
				businessNeed ? resolve(businessNeed) : reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE)))
			.catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
	})
}

const sortBusinessNeedsByTags = (businessNeeds: any, tags: [string]) => {
	for (const businessNeed of businessNeeds) {
		businessNeed.score = getScoreByTags(businessNeed.tags, tags)
	}

	businessNeeds = businessNeeds.sort((a, b) => b.score - a.score)

	if (tags.length > 0) {
		businessNeeds = businessNeeds.filter(e => e.score > 0)
	}

	return businessNeeds
}

const getScoreByTags = (businessNeedTags: [string], tags: [string]): number => {
	let businessNeedMatchScore: number = 0

	for (let iet = 0; iet < businessNeedTags.length; iet++) {
		businessNeedTags[iet] = slugify(businessNeedTags[iet])

		for (let imt = 0; imt < tags.length; imt++) {
			const matchTag = slugify(tags[imt])

			if (matchTag === businessNeedTags[iet]) {
				businessNeedMatchScore += ((tags.length - (imt as number)) * (businessNeedTags.length - (iet as number)))
			}
		}
	}

	return businessNeedMatchScore
}