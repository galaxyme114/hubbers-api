import * as bcrypt from 'bcrypt-nodejs'

import {
	HBE004_FAILED_TO_CREATE,
	HBE006_FAILED_TO_UPDATE,
	HBE011_FAILED_TO_LOGIN,
	HBE013_ALREADY_REGISTERED
} from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { JWTToken, PasswordResetToken, UserRecord } from '../interfaces/user'
import { UserModel, UserSchema, UserSchemaModel } from '../models/user'
import { generateToken, signJWTToken } from '../utils/jwt'

/**
 * Register a user and check for existing users either by email or phone number
 *
 * @param userData
 */
export const registerUser = (userData: Partial<UserRecord>) => {
	const salt = bcrypt.genSaltSync()
	userData.password = bcrypt.hashSync(userData.password, salt)
	
	return new Promise<JWTToken>((resolve, reject) => {
		UserSchemaModel.findOne({ email: userData.email })
			.then((userExist: UserModel) => {
				if (userExist) { reject(new HubbersBaseError(HBE013_ALREADY_REGISTERED)) } else {
					const user = new UserSchemaModel(userData)
					user.save().then((newUser: UserModel) => {
						if (!newUser) { reject((new HubbersBaseError(HBE004_FAILED_TO_CREATE))) } else {
							resolve(signJWTToken(newUser))
						}
					})
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}

/**
 * Login a user by their email / password
 *
 * @param email
 * @param password
 */
export const loginUser = (email: string, password: string) => {
	return new Promise<JWTToken>((resolve, reject) => {
		UserSchemaModel.findOne({ email })
			.then((user: UserModel) => {
				if (!user) { 
					console.log('==================================> !User');
					reject(new HubbersBaseError(HBE011_FAILED_TO_LOGIN)) 
				} else {
					UserSchema.methods.comparePassword(password, user.password, (err, isMatch) => {
						if (isMatch && !err) {
							resolve(signJWTToken(user))
						} else {
							reject(new HubbersBaseError(HBE011_FAILED_TO_LOGIN))
						}
					})
				}
			}).catch((error) => reject(new HubbersBaseError(HBE011_FAILED_TO_LOGIN, error)))
	})
}

/**
 * Login a user by their phone number and password
 *
 * @param phoneNumberCountryCode
 * @param phoneNumber
 * @param password
 */
export const loginUserPhone = (phoneNumberCountryCode: string, phoneNumber: string, password: string) => {
	return new Promise<JWTToken>((resolve, reject) => {
		UserSchemaModel.findOne({ phoneNumberCountryCode, phoneNumber })
			.then((user: UserModel) => {
				if (!user) { reject(new HubbersBaseError(HBE011_FAILED_TO_LOGIN)) } else {
					UserSchema.methods.comparePassword(password, user.password, (err, isMatch) => {
						if (isMatch && !err) {
							resolve(signJWTToken(user))
						} else {
							reject(new HubbersBaseError(HBE011_FAILED_TO_LOGIN))
						}
					})
				}
			}).catch((error) => reject(new HubbersBaseError(HBE011_FAILED_TO_LOGIN, error)))
	})
}

/**
 * Request a password reset using an email
 *
 * @param email
 */
export const requestUserPasswordReset = (email: string) => {
	return new Promise<PasswordResetToken>(async (resolve, reject) => {
		const token = await generateToken()
		
		UserSchemaModel.findOne({ email })
			.then((user: UserModel) => {
				user.resetPasswordToken = token
				// user.resetPasswordExpires = Date.now() + (3600000 * 24)
				
				user.save().then(() => resolve({ token }))
			}).catch((error) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}

/**
 * Recover a user's password from the password reset email
 *
 * @param token Reset token sent via email
 * @param password New password set by the user
 */
export const recoverUserPassword = (token: string, password: string) => {
	return new Promise<JWTToken>(async (resolve, reject) => {
		UserSchemaModel.findOne({ resetPasswordToken: token })
			.then((user: UserModel) => {
				if (!user) { reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE)) } else {
					const salt = bcrypt.genSaltSync()
					user.password = bcrypt.hashSync(password, salt)
					user.resetPasswordToken = null
					
					user.save().then((newUser: UserModel) => {
						if (!newUser) { reject((new HubbersBaseError(HBE006_FAILED_TO_UPDATE))) } else {
							resolve(signJWTToken(newUser))
						}
					})
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}