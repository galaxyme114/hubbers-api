import { HBE003_FAILED_TO_FETCH, HBE006_FAILED_TO_UPDATE } from '../constants/errors'
import { USER_POPULATE_PUBLIC_ARRAY, USER_PUBLIC_FIELD_ARRAY, USER_FULL_PUBLIC_FIELD_ARRAY } from '../constants/legacyDbSelect'
import { HubbersBaseError } from '../errors'
import { UserModel, UserSchemaModel } from '../models/user'
import { EventModel, EventSchemaModel } from '../models/event'
import { ProjectModel, ProjectSchemaModel } from '../models/project'

import { filterObject } from '../utils/stringUtils'
import cons = require('consolidate')

const allowedKeys = ['id', 'name', 'last_name', 'full_name', 'email', 'gender', 'dob',
	'contact_number', 'contact_time', 'thumbnail_image_url', 'role', 'facebook',
	'linkedin', 'google', 'twitter', 'wechat', 'instagram', 'skype_id', 'city', 'address', 'state', 'country_origin',
	'country_residence', 'bio', 'position', 'is_site_investor', 'is_team_member', 'follower_count', 'following_count',
	'projects', 'roles', 'innovations', 'products', 'contests', 'activities', 'share_bids', 'created_at', 'updated_at',
	'creator', 'expert', 'investor', 'skills', 'expertise_categories', 'contesting', 'judging']

export const fetchUserProfileById = (userId: string) => {
	return new Promise<UserModel>((resolve, reject) => {
		UserSchemaModel.findById(userId)
			.then((user: UserModel) => resolve(user))
			.catch(error => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

// Restrict access for public route 
export const fetchPublicById = (userId: string) => {
	return new Promise<any>((resolve, reject) => {
		UserSchemaModel.findById(userId).populate('associatedCommunity')
			.then((user: UserModel) => resolve(filterObject(user.toObject(), USER_PUBLIC_FIELD_ARRAY)))
			.catch(error => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

// Fetching user full info
export const fetchFullPublicById = (userId: string) => {
	return new Promise<any>((resolve, reject) => {
		UserSchemaModel.findById(userId)
			.then(async (user: any) => {
				let attendedEvent, projects
				try {
					attendedEvent = await EventSchemaModel.find({ attending: { $in: [userId] } })

				} catch (err) {
					reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, err))
				}

				try {
					projects = await ProjectSchemaModel.find({ user: { $in: [userId] } })
				} catch (err) {
					reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, err))
				}

				let eventVisitedCount = attendedEvent.length > 0 ? attendedEvent.length : 0
				let projectCounts = projects.length > 0 ? projects.length : 0
				let contestCount = user.userActivity.map(c => c.entityType === 'contest')
				contestCount = contestCount.length > 0 ? contestCount.length : 0
				let filtered = filterObject(user.toObject(), USER_FULL_PUBLIC_FIELD_ARRAY)

				resolve({ ...filtered, attendedEvent, eventVisitedCount, contestCount, projectCounts })
			})
			.catch(error => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}


export const fetchPublicProfileById = (userId: string) => {
	return new Promise<any>((resolve, reject) => {
		UserSchemaModel.findById(userId)
			.then((user: UserModel) => resolve(filterObject(user.toObject(), USER_POPULATE_PUBLIC_ARRAY)))
			.catch(error => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

export const updateUserProfile = (userId: string, updatedProfile: any) => {
	return new Promise<any>((resolve, reject) => {
		UserSchemaModel.findOneAndUpdate({ _id: userId }, { $set: updatedProfile }, { new: true })
			.then((profile: UserModel) => resolve(profile))
			.catch(error => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Get a list of known associates from the legacy DB
 *
 * @param {number} userId
 * @param {string} searchQuery
 * @returns {Promise<any>}
 */
export const fetchKnownAssociatesById = (userId: string, searchQuery: string) => {
	return new Promise<any>((resolve, reject) => {
		UserSchemaModel.find({ name: { $regex: searchQuery, $options: '$i' } })
			.then((result: any) => resolve(result))
			.catch((error: any) => { reject(error) })
	})
}