import * as bcrypt from 'bcrypt-nodejs'
import {
	HBE003_FAILED_TO_FETCH, HBE004_FAILED_TO_CREATE, HBE006_FAILED_TO_UPDATE, HBE007_FAILED_TO_DELETE,
	HBE013_ALREADY_REGISTERED
} from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { UserRecord } from '../interfaces/user'
import { UserModel, UserSchemaModel } from '../models/user'

export const fetchAllUsers = () => {
	return new Promise<ReadonlyArray<UserModel>>((resolve, reject) => {
		UserSchemaModel.find({})
			.then((users: ReadonlyArray<UserModel>) => resolve(users))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

export const fetchUser = (userId: string) => {
	return new Promise<UserModel>((resolve, reject) => {
		UserSchemaModel.findOne({ _id: userId }).populate('associatedCommunity')
			.then((user: UserModel) => resolve(user))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

export const createUser = (userData: Partial<UserRecord>) => {
	return new Promise<UserModel>((resolve, reject) => {
		const salt = bcrypt.genSaltSync()
		userData.password = bcrypt.hashSync(userData.password, salt)

		UserSchemaModel.findOne({ email: userData.email })
			.then((userExist: UserModel) => {
				if (userExist) { reject(new HubbersBaseError(HBE013_ALREADY_REGISTERED)) } else {
					const user = new UserSchemaModel(userData)
					user.save().then((newUser: UserModel) => {
						if (!newUser) { reject((new HubbersBaseError(HBE004_FAILED_TO_CREATE))) } else { resolve(newUser) }
					})
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}

export const updateUser = (userId: string, userData: Partial<UserRecord>) => {
	return new Promise<UserModel>((resolve, reject) => {
		
		if (userData.password) {
			const salt = bcrypt.genSaltSync()
			userData.password = bcrypt.hashSync(userData.password, salt)
		}
		
		UserSchemaModel.findOneAndUpdate({ _id: userId }, { $set: userData },
			/* tslint:disable */{ 'new': true }) /* tslint:enable */
			.then((user: UserModel) => resolve(user))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

export const removeUser = (userId: string) => {
	return new Promise<UserModel>((resolve, reject) => {
		UserSchemaModel.findOneAndRemove({ _id: userId })
			.then((user: UserModel) =>
				user ? resolve(user) : reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE)))
			.catch((error: any) => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
	})
}