import { HBET001_WELCOME_INVESTOR } from '../constants/emailTemplate'
import { EmailBuilder } from '../utils/emailClient'

import { getNumberWithCommas } from '../utils/currency'

export interface InvestorNewSharesNotification {
	id: number
	email: string
	name: string
	shares: number
	shareValue: number
}

export const welcome = async (data: InvestorNewSharesNotification) => {
	const to = [ data.email ]
	const mailData = {
		name: data.name,
		shares: getNumberWithCommas(data.shares),
		shareValue: data.shareValue,
		totalShareValue: getNumberWithCommas(data.shares * data.shareValue)
	}

	const eb = new EmailBuilder(HBET001_WELCOME_INVESTOR, to, mailData)
	return eb.send()
}