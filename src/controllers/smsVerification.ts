import redisClient from '../utils/redisClient'
import { sendSMSCode } from '../utils/smsClient'

interface SMSVerificationRecord {
	ts: string
	code: number
}

export const requestSMSCode = (phoneNumber: string) => {
	return new Promise(async (resolve, reject) => {
		try {
			await canRequestAnotherCode(phoneNumber)
			const code: number = await sendSMSCode(phoneNumber)
			await storeSMSData(phoneNumber, code)
			resolve()
		} catch (error) {
			reject(error)
		}
	})
}

export const verifySMSCode = (phoneNumber: string, code: number) => {
	return new Promise(async (resolve, reject) => {
		try {
			await hasValidSMSData(phoneNumber, code)
			clearSMSData(phoneNumber)
			resolve()
		} catch (error) {
			reject(error)
		}
	})
}

const hasValidSMSData = (phoneNumber: string, code: number) => {
	return new Promise((resolve, reject) => {
		redisClient.getAsync(phoneNumber)
			.then((smsDataValue: string) => {
				const smsData: SMSVerificationRecord = JSON.parse(smsDataValue)
				if (smsData && (smsData.code.toString() === code.toString())) {
					resolve(smsData)
				} else {
					reject()
				}
			}).catch(() => reject())
	})
}

const clearSMSData = (phoneNumber: string) => {
	redisClient.del(phoneNumber)
}

const canRequestAnotherCode = (phoneNumber: string) => {
	return new Promise((resolve, reject) => {
		redisClient.getAsync(phoneNumber)
			.then((smsDataValue: string) => {
				const smsData: SMSVerificationRecord = JSON.parse(smsDataValue)

				if (smsData === null) {
					resolve()
				} else if (smsData && ((new Date().getTime() - new Date(smsData.ts).getTime())  > 30000)) {
					resolve()
				} else {
					reject()
				}
			}).catch(() => reject())
	})
}

const storeSMSData = (phoneNumber: string, code: number) => {
	return redisClient.setAsync(phoneNumber, JSON.stringify({
		code, ts: new Date().getTime()
	}))
}