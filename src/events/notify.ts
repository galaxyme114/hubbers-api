import { HBET007_NOTIFY_NEW_INVESTOR, HBET007_NOTIFY_NEW_OBSERVER } from '../constants/emailTemplate'
import { UserSchemaModel } from '../models/user'
import { EmailBuilder } from '../utils/emailClient'

export interface NotifyNewObserver {
	id: number
	name: string
	thumbnailImageUrl: string
	nationality: string
}

export interface NotifyNewInvestor extends NotifyNewObserver {
	shares: string
}

/**
 * Send notification to the investor group
 * @param {NotifyNewObserver} observer
 * @returns {Promise<void>}
 */
export const notifyObserverGroup = async (observer: NotifyNewObserver) => {
	return new Promise((resolve, reject) => {
		UserSchemaModel.find({ capabilities: 'site-investor' }).then((userData) => {
			userData = userData.filter((u: any) => u._id.toString() !== observer.id)
			// Loop through all users and send the individual email
			userData.map((u: any) => doNotifyObserverGroup(u.name, u.email, observer))
			resolve()
		}).catch((error) => reject(error))
	})
}

const doNotifyObserverGroup = (recipientName: string, recipientEmail: string, observer: NotifyNewObserver) => {
	const to = [recipientEmail]
	const mailData = {
		name: recipientName,
		observerName: observer.name,
		observerNationality: observer.nationality,
		observerThumbnailImageUrl: observer.thumbnailImageUrl
	}

	const eb = new EmailBuilder(HBET007_NOTIFY_NEW_OBSERVER, to, mailData)
	return eb.send()
}

/**
 *
 * @param {NotifyNewInvestor} investor
 * @returns {Promise<void>}
 */
export const notifyInvestorGroup = async (investor: NotifyNewInvestor) => {
	UserSchemaModel.find({ 'capabilities': 'site-investor', 'shares.0': { $exists: true } })
		.then((result) => {
			if (result.length > 0) {
				const userData = result.filter((u: any) => u._id.toString() !== investor.id)
				// Loop through all users and send the individual email
				userData.map((u: any) => doNotifyInvestorGroup(u.name, u.email, investor))
			}
		})
}

const doNotifyInvestorGroup = (recipientName: string, recipientEmail: string, investor: NotifyNewInvestor) => {
	const to = [recipientEmail]
	const mailData = {
		name: recipientName,
		investorName: investor.name,
		investorNationality: investor.nationality,
		investorThumbnailImageUrl: investor.thumbnailImageUrl,
		investorShares: investor.shares
	}

	const eb = new EmailBuilder(HBET007_NOTIFY_NEW_INVESTOR, to, mailData)
	return eb.send()
}