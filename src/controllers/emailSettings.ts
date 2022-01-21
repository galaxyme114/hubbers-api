import * as shortid from 'shortid'
import {
	HBE003_FAILED_TO_FETCH, HBE006_FAILED_TO_UPDATE, HBE015_FAILED_TO_VERIFY,
	HBE040_NOT_FOUND
} from '../constants/errors'
import { HubbersBaseError } from '../errors/index'
import { EmailSettingsRecord } from '../interfaces/emailSettings'
import { EmailSettingsModel, EmailSettingsSchemaModel } from '../models/emailSettings'

/**
 * Fetch a single users' email settings
 */
export const fetchEmailSettings = (shortId: string, accessCode: string) => {
	return new Promise<EmailSettingsModel>((resolve, reject) => {
		EmailSettingsSchemaModel.findOne({ shortId, accessCodes: accessCode })
			.then((emailSettings) => emailSettings ? resolve(emailSettings) : reject(new HubbersBaseError(HBE040_NOT_FOUND)))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH)))
	})
}

/**
 * Update email settings
 */
export const updateEmailSettings = (
	shortId: string, accessCode: string, updatedSettings: Partial<EmailSettingsRecord>) => {
	return new Promise<EmailSettingsModel>((resolve, reject) => {
		EmailSettingsSchemaModel.findOneAndUpdate({ shortId, accessCodes: accessCode },
			{ $set: { allEmails: updatedSettings.allEmails} }, /* tslint:disable */ { 'new': true }) /* tslint:enable */
			.then((emailSettings) => resolve(emailSettings))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE)))
	})
}

/**
 * Validate email sending capability
 */
export const validateEmailSendingCapability = (emails: string[]) => {
	return new Promise<string[]>((resolve, reject) => {
		EmailSettingsSchemaModel.find({ email: { $in: emails } })
			.then((emailSettings) => emailSettings ? emailSettings.map(es => es.email) : [])
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH)))
	})
}

/**
 * Generate email settings code
 */
export const generateAccessCode = (emails: string[]) => {
	return new Promise<any>((resolve, reject) => {
		const emailObjects = []

		EmailSettingsSchemaModel.find({ email: { $in: emails } }, 'shortId email allEmails')
			.then((foundEmails: Partial<EmailSettingsModel[]>) => {
				const bulkOperations = []
				const matchedEmails = foundEmails.filter(fe => emails.indexOf(fe.email) !== -1).map(fe => fe.email)
				const missingEmails = emails.filter(e => matchedEmails.indexOf(e) === -1)

				if (missingEmails.length > 0) {
					missingEmails.map((email: string) => {
						const accessCode = shortid.generate()
						const shortId = shortid.generate()

						emailObjects.push({ email, shortId, accessCode })

						bulkOperations.push({
							updateOne: {
								filter: { email },
								update: { email, shortId, $push: { accessCodes: accessCode } },
								upsert: true,
								setDefaultsOnInsert: true
							}
						})
					})
				}

				foundEmails.map((emailSetting: Partial<EmailSettingsModel>) => {
					if (emailSetting.allEmails) {
						const accessCode = shortid.generate()
						emailObjects.push({ email: emailSetting.email, shortId: emailSetting.shortId, accessCode })

						bulkOperations.push({
							updateOne: {
								filter: { email: emailSetting.email },
								update: { email: emailSetting.email, $push: { accessCodes: accessCode } },
								upsert: true,
								setDefaultsOnInsert: true
							}
						})
					}
				})

				return EmailSettingsSchemaModel.bulkWrite(bulkOperations)
			}).then(() => resolve(emailObjects))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}