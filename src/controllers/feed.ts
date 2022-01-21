import { PostModel } from '../models/post'
import { adminFetchAllPosts, fetchAllPosts } from './posts'

/**
 * Fetch user feed
 */
export const fetchUserFeed = (userId: string) => {
	return new Promise<any>(async (resolve, reject) => {
		let feed: ReadonlyArray<PostModel> = []

		try {
			feed = await fetchAllPosts(userId)
		} catch (error) { console.log('failed to fetch user feed') }

		const userFeed = {
			notifications: [],
			promoBanners: [],
			feed,
			businessNeeds: []
		}

		resolve(userFeed)
	})
}

/**
 * Admin Fetch user feed
 */
export const adminFetchUserFeed = (userId: string) => {
	return new Promise<any>(async (resolve, reject) => {
		let feed: ReadonlyArray<PostModel> = []

		try {
			feed = await adminFetchAllPosts(userId)
		} catch (error) { console.log('failed to fetch user feed') }

		const userFeed = {
			notifications: [],
			promoBanners: [],
			feed,
			businessNeeds: []
		}

		resolve(userFeed)
	})
}
