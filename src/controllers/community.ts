import axios from 'axios'
import { HUBBER_BLOGD_API } from '../constants/api'

import { CommunityModel, CommunitySchemaModel } from '../models/community'
import { EventModel, EventSchemaModel } from '../models/event'
import { PostModel, PostSchemaModel } from '../models/post'
import { fetchEvent } from './events'
import {
	HBE003_FAILED_TO_FETCH,
	HBE004_FAILED_TO_CREATE,
	HBE006_FAILED_TO_UPDATE,
	HBE007_FAILED_TO_DELETE,
	HBE040_NOT_FOUND
} from '../constants/errors'
import { HubbersBaseError } from '../errors'

import { fetchUser } from './users'
import { CommunityRecord, BlogsRecord } from '../interfaces/community'
import cons = require('consolidate')
const xml2js = require('xml2js');

/**
 * Admin Create Community
 *
 * @param newContestData
 */
export const adminCreateCommunity = (newCommunityData: Partial<CommunityRecord>) => {
	return new Promise<CommunityRecord>((resolve, reject) => {

		const newCommunity = new CommunitySchemaModel(newCommunityData)
		newCommunity.save().then((community: CommunityRecord) => {
			resolve(community)
		}).catch((error: any) => {
			reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
		})
	})
}

/**
 * Admin Fetch all Community
 *
 */
export const adminFetchAllCommunity = () => {
	return new Promise((resolve, reject) => {
		CommunitySchemaModel.find()
			.sort('-startTime')
			.then((community: CommunityModel[]) => {

				resolve(community)
			}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * User Fetch all Community
 *
 */
export const fetchAllCommunity = () => {
	return new Promise((resolve, reject) => {
		CommunitySchemaModel.find()
			.sort('-startTime')
			.then((community: CommunityModel[]) => {

				resolve(community)
			}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 *  Fetch  Hubber blogs 
 */
export const fetchBlogs = () => {
	return new Promise<BlogsRecord[]>(async (resolve, reject) => {
		try {
			let newBlogs = []
			await axios.get(HUBBER_BLOGD_API)
				.then((response) => {

					const data = response.data

					var parser = new xml2js.Parser();
					parser.parseStringPromise(data).then((result) => {
						result.rss.channel[0].item.map(async (i, k) => {
							let obj: any = {}

							await Object.keys(i).forEach((uk, v) => {
								if (i.hasOwnProperty(uk)) {
									obj[uk.replace(/:/g, '')] = i[uk]
								}
							})
							newBlogs.push({
								'title': obj.title[0] ? obj.title[0] : '',
								'description': obj.description[0] ? obj.description[0] : '',
								'link': obj.link[0] ? obj.link[0] : '',
								'_id': obj.guid[0] && obj.guid[0]._ ? obj.guid[0]._ : '',
								'category': obj.category.length > 0 ? obj.category : [],
								'author': obj.dccreator[0] ? obj.dccreator[0] : 'HUBBERS',
								'content': obj.contentencoded[0] ? obj.contentencoded[0] : '',
								'createdAt': obj.pubDate[0] ? new Date(obj.pubDate[0]).toISOString() : '',
								'featuredImageUrl': obj.mediacontent[0] && obj.mediacontent[0].$.url ? [obj.mediacontent[0].$.url] : []
							})
						})
						resolve(newBlogs)

					}).catch((err) => {
						reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, err))
					});
				}).catch((e) => {
					reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, e))
				})
		} catch (e) {
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, e))
		}
	})
}

/**
 * Public Fetch all Community
 *
 */
export const fetchAllCommunityForPublic = (userId: any) => {
	return new Promise(async (resolve, reject) => {
		let communityId = null
		if (userId !== null) {
			try {
				const foundUser = await fetchUser(userId)
				if (foundUser && (foundUser.associatedCommunity.length > 0)) {
					communityId = foundUser.associatedCommunity[0]
					// Schema = CommunitySchemaModel.findById(communityId)
				}

			} catch (error) {
				console.log('error in empty response', error)
				reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
			}
		}

		CommunitySchemaModel.findOne(!communityId ? {} : { _id: communityId }).then(async (community: any) => {

			try {  //Event filtered by selected community

				const events = await fetchEventByCommunityId({ community: community._id })
				// filtered by selected community, we will use tags to filter by community
				const foundPosts = await fetchPostByTags(community.tags)
				const foundBlogs = await fetchBlogsByTags(community.tags)

				resolve({ ...community.toObject(), events, posts: foundPosts, blogs: foundBlogs })

			} catch (error) {
				console.log('error in empty response', error)
				reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
			}

		}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * Admin Fetch single Community
 *
 */
export const adminFetchSingleCommunity = (communityId: string) => {
	return new Promise((resolve, reject) => {
		CommunitySchemaModel.findById(communityId)
			.then((community: CommunityModel) => {
				resolve(community)
			}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * User Fetch single Community
 *
 */
export const fetchSingleCommunity = (communityId: string) => {
	return new Promise((resolve, reject) => {
		CommunitySchemaModel.findById(communityId)
			.then((community: CommunityModel) => {
				resolve(community)
			}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * Public Fetch single Community
 *
 */
export const fetchSingleCommunityForPublic = (communityId: string) => {
	return new Promise((resolve, reject) => {
		CommunitySchemaModel.findById(communityId)
			.then((community: CommunityModel) => {
				resolve(community)
			}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * Admin Update Community
 *
 */
export const adminUpdateCommunity = (communityId: string, newCommunityData: any) => {
	return new Promise<CommunityModel>((resolve, reject) => {
		console.log('communityData', newCommunityData)

		CommunitySchemaModel.findOneAndUpdate({ _id: communityId }, { $set: newCommunityData }, { new: true })
			.then((community: CommunityModel) => {

				resolve(community)
			}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}


/**
 * Admin Remove Community
 *
 */
export const adminRemoveCommunity = (communityId: string) => {
	return new Promise((resolve, reject) => {
		CommunitySchemaModel.findOneAndRemove({ _id: communityId })
			.then((community: CommunityModel) => {
				resolve(community)
			}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}


// Helper to fetch posts by community ID
export const fetchEventByCommunityId = (communityId: object) => {
	return new Promise(async (resolve, reject) => {
		await EventSchemaModel.find(communityId).then((events: EventModel[]) => {
			resolve(events)
		}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

// Helper to fetch posts by Tags
export const fetchPostByTags = (tags: string[]) => {
	return new Promise(async (resolve, reject) => {
		await PostSchemaModel.find({ tags: { $in: tags } })
			.then((posts: PostModel[]) => {
				resolve(posts)
			}).catch(error => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

// Helper to fetch blogs by Tags
export const fetchBlogsByTags = (tags: string[]) => {
	return new Promise(async (resolve, reject) => {
		try {
			let newArr = []
			let blogs = await fetchBlogs()
			blogs.map((blog) => {
				const intersection = blog.category.filter(element => tags.includes(element));
				if (intersection.length) {
					newArr.push(blog)
				}
			})

			resolve(newArr)
		}
		catch (error) {
			console.log('error in empty response', error)
			resolve([])
		}
	})
}