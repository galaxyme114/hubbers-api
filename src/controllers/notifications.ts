import { HBE003_FAILED_TO_FETCH, HBE006_FAILED_TO_UPDATE } from '../constants/errors'
import { HubbersBaseError } from '../errors/index'

import { NotificationModel, NotificationSchemaModel } from '../models/notification'

interface NotificationsResponse {
	notifications: NotificationModel[],
	notificationCounter: {
		all: number
		conversations: number
		contests: number
		feed: number
	}
}

/**
 * Fetch all notifications
 */
export const fetchAllNotifications = (userId: string) => {
	return new Promise<NotificationsResponse>(async (resolve, reject) => {
		const notificationCounter = { all: 0, conversations: 0, contests: 0, feed: 0 }
		const notificationLists = []

		try {
			const rawNotifications = await NotificationSchemaModel
				.find({ user: userId }).sort({ createdAt: 'descending' }).limit(20)

			rawNotifications.map((rn: NotificationModel) => {
				if (!rn.isSeen) {
					notificationCounter.all++

					if (notificationCounter.hasOwnProperty(rn.key)) {
						notificationCounter[rn.key]++
					}
				}

				notificationLists.push(rn.toObject())
			})

			resolve({ notifications: notificationLists, notificationCounter })
		} catch (error) {
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH))
		}
	})
}

/**
 * Update the seen status of the post notifications
 */
export const updateNotificationsSeen = (userId: string, notificationIds: string[]) => {
	return new Promise<ReadonlyArray<NotificationModel>>((resolve, reject) => {
		NotificationSchemaModel.updateMany({ _id: { $in: notificationIds }, user: userId },
			{ $set: { isSeen : true } },
			/* tslint:disable */ { 'new': true }) /* tslint:enable */
			.then((notifications) => resolve(notifications))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}