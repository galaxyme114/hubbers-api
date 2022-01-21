import * as SendgridMail from '@sendgrid/mail'
import * as consolidate from 'consolidate'
import * as path from 'path'
import { HubbersEmailTemplateType } from '../constants/emailTemplate'
import { generateAccessCode, validateEmailSendingCapability } from '../controllers/emailSettings'

SendgridMail.setApiKey(process.env.SENDGRID_API_KEY)

export class EmailBuilder {
	private static parseBody(view: string, data: any) {
		return new Promise((resolve, reject) => {
			const fileName = path.join(__dirname, '/../', view)
			consolidate.swig(fileName, data, (err, html) => err ? reject(err) : resolve(html))
		})
	}

	private template: HubbersEmailTemplateType
	private to: string[]
	private from: string
	private subject: string
	private data: object

	constructor(template: HubbersEmailTemplateType, to: string[], data: object) {
		this.template = template
		this.to = to
		this.from = template.from
		this.subject = template.subject
		this.data = data
	}

	public setFrom(from: string) {
		this.from = from
	}

	public setSubject(subject: string) {
		this.subject = subject
	}

	public send() {
		const { to, from, subject, template, data } = this

		return generateAccessCode(to)
			.then((recipientEmails) => Promise.all(recipientEmails.map((re: any) => {
				return EmailBuilder.parseBody(template.view, { ...data, emailCode: re.shortId, accessCode: re.accessCode })
					.then((html: string) => SendgridMail.send(
						{ to: re.email, from: { email: from, name: 'Hubbers' }, subject, html }))
			})))
	}
}

export const EmailClient = SendgridMail
