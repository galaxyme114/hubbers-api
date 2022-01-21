import { Types } from 'mongoose'

import { HBET008_NOTIFY_EXPERT } from '../constants/emailTemplate'
import { HBE040_NOT_FOUND } from '../constants/errors'

import { ExpertiseSchemaModel} from '../models/expertise'
import { EmailBuilder } from '../utils/emailClient'

export const notifyExpertise = async (id: string) => {
	console.log('notifyExpertise = ' + id)
}

export const notifyExpert = async (expertiseOrder: any) => {
	return new Promise((resolve, reject) => {
		ExpertiseSchemaModel.findOne({_id: Types.ObjectId(expertiseOrder.expertise)}).populate('user')
			.then(async (expertiseData: any) => {

				const selectedPackage = expertiseData.packages.filter(p => {
					return p._id.toString() === expertiseOrder.selectedPackage.toString()
				})
				doNotifyExpert(expertiseData.user.name, expertiseData.user.email, expertiseData,
					selectedPackage[0], expertiseOrder.user.name )
				resolve()
			}).catch((error) => reject(HBE040_NOT_FOUND))
	})

}

const doNotifyExpert =
	(recipientName: string, recipientEmail: string, expertiseData: any, selectedPackage: any, userName: any) => {
	const to = [recipientEmail]
	const mailData = {
		name: recipientName,
		expertiseName: expertiseData.name,
		userName: userName.name,
		packageName: selectedPackage.name,
		shortId: expertiseData.shortId,
		slug: expertiseData.slug

	}
	const eb = new EmailBuilder(HBET008_NOTIFY_EXPERT, to, mailData)
	return eb.send()
}