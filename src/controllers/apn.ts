import { HBE003_FAILED_TO_FETCH, HBE004_FAILED_TO_CREATE } from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { UserSchemaModel } from '../models/user'

export const userStoreApn = (userId: string, token: string, type: string) => {
	return new Promise<any>((resolve, reject) => {
		UserSchemaModel.findOne({ _id: userId }).then((result: any) => {
			if (result.pushAssociation.length === 0) {
				const insertData = { type, token }
				result.pushAssociation = [insertData]
				result.save().then((id: any) => {
					resolve(id)
				}).catch((error: any) => {
					reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
				})
			} else {
				UserSchemaModel.findOneAndUpdate({ $and: [{ _id: userId }, { 'pushAssociation.type': type }] },
					{ $set: { 'pushAssociation.$.token': token, 'pushAssociation.$.type': type } }, { new: true })
					.then((id: any) => {
					resolve(id)
				}).catch((error: any) => {
					reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE))
				})
			}
		})
	})
}

export const getUserToken = (userId: string) => {
	return new Promise<any>((resolve, reject) => {
		UserSchemaModel.findOne({ _id: userId })
			.then((result: any) => {
				if (result) {
					resolve(result.pushAssociation)
				} else {
					reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH))
				}
			})
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}
