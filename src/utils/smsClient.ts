import * as AliyunSMS from '@alicloud/sms-sdk'
import * as Twilio from 'twilio'

export const sendSMSCode = (phoneNumber: string) => {
	const smsClient = new (Twilio as any)(process.env.TWILIO_ID, process.env.TWILIO_SECRET)
	
	return new Promise<number>(async (resolve, reject) => {
		try {
			const code = Math.floor(Math.random() * 900000) + 100000
			await smsClient.messages.create({
				body: `[Hubbers] Your verification code is: ${code}.`,
				to: phoneNumber,
				from: process.env.TWILIO_NUMBER
			})
			resolve(code)
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Request SMS code and return a string with the verification code used
 */
export const sendSMSVerification = (phoneNumber: string, phoneNumberCountryCode: string) => {
	return new Promise<number>(async (resolve, reject) => {
		try {
			const smsVerificationCode = Math.floor(1000 + Math.random() * 9000)
			
			if (phoneNumberCountryCode.indexOf('86') !== -1) {
				const smsClient = new AliyunSMS({
					accessKeyId: process.env.ALIYUN_SMS_KEY,
					secretAccessKey: process.env.ALIYUN_SMS_SECRET
				})
				
				const smsResponse = await smsClient.sendSMS({
					PhoneNumbers: phoneNumber,
					SignName: process.env.ALIYUN_SMS_SIGN_NAME,
					TemplateCode: process.env.ALIYUN_SMS_VERIFY_TEMPLATE,
					TemplateParam: JSON.stringify({ code: smsVerificationCode })
				})
				
				if (smsResponse.Code !== 'OK') { throw new Error('Unable to send SMS') }
				
				resolve(smsVerificationCode)
			} else {
				const twilioClient = new (Twilio as any)(process.env.TWILIO_ID, process.env.TWILIO_SECRET)
				
				await twilioClient.messages.create({
					body: `[HUBBERS] Your verification code is: ${smsVerificationCode}}`,
					to: '+' + phoneNumberCountryCode + phoneNumber,
					from: process.env.TWILIO_NUMBER
				})
				
				resolve(smsVerificationCode)
			}
		} catch (error) {
			console.log('SMS Client Error', error)
			reject(error)
		}
	})
}