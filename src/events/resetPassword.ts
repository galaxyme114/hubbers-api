import { HBET009_RESET_PASSWORD } from '../constants/emailTemplate'
import { EmailBuilder } from '../utils/emailClient'

export interface NotifyResetPassword {
	name: string
	email: string
	token: string
	link: string
}

/**
 * Notify a user for their password reset
 *
 * @param {NotifyResetPassword} data
 */
export const notifyResetPassword = async (data: NotifyResetPassword) => {
	const to = [ data.email ]
	const mailData = {
		name: data.name,
		link: data.link
	}
	
	const eb = new EmailBuilder(HBET009_RESET_PASSWORD, to, mailData)
	eb.send()
}