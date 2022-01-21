import { HBE003_FAILED_TO_FETCH } from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { SMSVerificationModel, SMSVerificationSchemaModel } from '../models/smsVerification'
import { sendSMSVerification } from '../utils/smsClient'

interface SMSVerificationResponse {
	phoneNumber: string
	phoneNumberCountryCode: string
	smsCode: number
}

export const smsRequestCode = (phoneNumber: string, phoneNumberCountryCode: string) => {
	return new Promise<SMSVerificationResponse>(async (resolve, reject) => {
		try {
			const smsCode = await sendSMSVerification(phoneNumber, phoneNumberCountryCode)
			await saveSMSConfirmation(phoneNumber, phoneNumberCountryCode, smsCode)
			resolve({ phoneNumber, phoneNumberCountryCode, smsCode })
		} catch (error) {
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH))
		}
	})
}

export const smsVerifyCode = (phoneNumber: string, phoneNumberCountryCode: string, smsCode: number) => {
	return new Promise<SMSVerificationResponse>(async (resolve, reject) => {
		try {
			await verifySMSConfirmation(phoneNumber, phoneNumberCountryCode, smsCode)
			resolve({ phoneNumber, phoneNumberCountryCode, smsCode })
		} catch (error) {
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH))
		}
	})
}

const saveSMSConfirmation = (phoneNumber: string, phoneNumberCountryCode: string, smsCode: number) => {
	return new Promise<SMSVerificationModel>(async (resolve, reject) => {
		SMSVerificationSchemaModel.findOneAndUpdate({ phoneNumber, phoneNumberCountryCode },
			{ phoneNumberCountryCode, phoneNumber, smsCode }, { upsert: true })
			.then((smsVerification: SMSVerificationModel) => resolve(smsVerification))
			.catch((error) => reject(error))
	})
}

export const verifySMSConfirmation = (phoneNumber: string, phoneNumberCountryCode: string, smsCode: number) => {
	return new Promise<boolean>(async (resolve, reject) => {
		try {
			const smsVerification = await SMSVerificationSchemaModel.findOne({ phoneNumber, phoneNumberCountryCode, smsCode },
				{ phoneNumberCountryCode, phoneNumber, smsCode }, { upsert: true })
			
			await SMSVerificationSchemaModel.remove({ phoneNumber, phoneNumberCountryCode, smsCode })
			smsVerification !== null ? resolve() : reject()
		} catch (error) {
			reject(error)
		}
	})
}

export const parsePhoneNumber = (sourcePhoneNumber: string) => {
	const phoneNumber = sourcePhoneNumber
	const phoneNumberCountryCode = '86'
	
	return { phoneNumber, phoneNumberCountryCode }
}