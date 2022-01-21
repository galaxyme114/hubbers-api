import * as apn from 'apn'
import { getUserToken } from '../controllers/apn'
import apnProvider from '../utils/iosApn'

export interface PushNotificationPayload {
	title: string
	body: string
	payload: {
		key: string
		keyId: string
	}
}

/**
 * Helper function to send a push notification to the user
 *
 * @param {[number]} userIds
 * @param {PushNotificationPayload} data
 * @returns {Promise<number>}
 */
export const sendPushNotification = (userIds: [number], data: PushNotificationPayload) => {
	return new Promise<number>((resolve, reject) => {
		try {
			userIds.map(async (uid: any) => {
				const userToken = await getUserToken(uid)
				let notificationResult

				if (userToken && userToken.type === 'ios') {
					const note = new apn.Notification()
					note.expiry = Math.floor(Date.now() / 1000) + 3600
					note.badge = await getPushNotificationBadge(uid)
					note.alert = {
						title: data.title,
						body: data.body
					}
					note.payload = data.payload
					note.topic = 'io.hubbers.app'

					notificationResult = await apnProvider.send(note, userToken.token)
					resolve(notificationResult)
				} else {
					resolve()
				}
			})
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Returns the current user badge from the redis store
 *
 * @param {number} userId
 * @returns {Promise<number>}
 */
export const getPushNotificationBadge = (userId: string) => {
	return new Promise<number>((resolve, reject) => {
		resolve(0)
	})
}