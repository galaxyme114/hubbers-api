import axios from 'axios'
import { LINKEDIN_PROFILE_API, LINKEDIN_TOKEN_API, LINKEDIN_EMAIL_ADDRESS_API } from '../constants/api'
import { HBE003_FAILED_TO_FETCH } from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { LinkedinResponse } from '../interfaces/linkedin'
import { JWTToken } from '../interfaces/user'
import { UserModel, UserSchemaModel } from '../models/user'
import { signJWTToken } from '../utils/jwt'
import { fetchUserAssets } from './transactions'

export const authenticateUser = (userModel: UserModel) => {
	return new Promise<UserModel>(async (resolve, reject) => {
		try {
			const user = userModel.toObject()
			user.password = undefined

			// Add user assets
			user.assets = await fetchUserAssets(user._id)
			user.contests = []
			user.isSiteInvestor = true

			resolve(user)
		} catch (error) {
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
		}
	})
}

export const performLinkedinLogin = (code: string) => {
	return new Promise<JWTToken>(async (resolve, reject) => {
		try {
			const linkedinData = await getLinkedinData(code)
			// console.log('linkedinData', linkedinData)
			// Check if user exists, if not then create user
			const foundUser = await UserSchemaModel.findOne({ email: linkedinData.emailAddress })
			if (foundUser) {
				if (foundUser.linkedinId) { resolve(signJWTToken(foundUser)) } else {
					resolve(signJWTToken(await updateLinkedinUser(foundUser, linkedinData)))
				}
			} else {
				resolve(signJWTToken(await registerLinkedinUser(linkedinData)))
			}
		} catch (e) {
			console.log('linked in login error', e)
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, e))
		}
	})
}

const getLinkedinData = (code: string) => {
	return new Promise<any>(async (resolve, reject) => {
		try {
			// Fetch the token URL
			const accessTokenAPI = LINKEDIN_TOKEN_API
				.replace('{code}', code)
				.replace('{clientId}', process.env.LINKEDIN_CLIENT_ID)
				.replace('{clientSecret}', process.env.LINKEDIN_CLIENT_SECRET)
				.replace('{redirectUri}', process.env.LINKEDIN_REDIRECT_URI)

			const accessTokenResponse = await axios.get(accessTokenAPI)

			const accessToken = accessTokenResponse.data.access_token

			const userProfileResponse = await axios.get(LINKEDIN_PROFILE_API, 
			{headers: {
				"Access-Control-Allow-Origin" : "*",
				"Content-type": "Application/json",
				"Authorization": `Bearer ${accessToken}`
				}   
			}
			)
			const userEmailAddressResponse = await axios.get(LINKEDIN_EMAIL_ADDRESS_API, {headers: {
				"Access-Control-Allow-Origin" : "*",
				"Content-type": "Application/json",
				"Authorization": `Bearer ${accessToken}`
				}   
			})

			const userProfile = userProfileResponse.data
			const userEmailAddress = userEmailAddressResponse.data
			// console.log('userEmailAddress', userEmailAddress)
			resolve({id: userProfile.id, firstName: userProfile.firstName.localized.en_US, lastName: userProfile.lastName.localized.en_US, emailAddress: userEmailAddress.elements[0]['handle~'].emailAddress, isLoginWithLinkedin: true, linkedinId: userProfile.id});
		} catch (e) {
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, e))
		}
	})
}

const updateLinkedinUser = (user: UserModel, linkedinData: LinkedinResponse) => {
	return new Promise<UserModel>(async (resolve, reject) => {
		try {
			user.linkedinId = linkedinData.id
			resolve(await user.save())
		} catch (e) { reject(e) }
	})
}

const registerLinkedinUser = (linkedinData: LinkedinResponse) => {
	return new Promise<UserModel>(async (resolve, reject) => {
		try {
			console.log('registerLinkedinUser', registerLinkedinUser)

			const user = new UserSchemaModel({
				name: linkedinData.firstName, lastName: linkedinData.lastName, email: linkedinData.emailAddress,
				password: '-', headline: linkedinData.headline, industry: linkedinData.industry, linkedinId: linkedinData.id,
				isLoginWithLinkedin: linkedinData.isLoginWithLinkedin
			})
			resolve(await user.save())
		} catch (e) { reject(e) }
	})
}