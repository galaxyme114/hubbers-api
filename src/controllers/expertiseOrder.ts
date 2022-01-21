import { Types } from 'mongoose'
import {HBE006_FAILED_TO_UPDATE, HBE007_FAILED_TO_DELETE, HBE040_NOT_FOUND} from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { BriefDataRecord } from '../interfaces/expertise'
import { ExpertiseOrderModel, ExpertiseOrderSchemaModel } from '../models/expertiseOrder'

export const updateExpertiseOrder = (expertiseOrderId: string, userId: string, briefData: BriefDataRecord) => {
	return new Promise<ExpertiseOrderModel>((resolve, reject) => {
		ExpertiseOrderSchemaModel.findOne({ _id: Types.ObjectId(expertiseOrderId), user: userId })
			.then((expertiseOrder: ExpertiseOrderModel) => {
				if (!expertiseOrder) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					expertiseOrder.briefData = briefData
					expertiseOrder.offers = [{
						name: 'First package name, I will make something for you',
						currency: 'USD',
						breakdown: [{
							name: 'I will make this for you',
							delivery: 5,
							price: 300,
							selected: true
						}, {
							name: 'Additional: 2 days delivery',
							delivery: 2,
							price: 100,
							selected: true
						}] as any,
						selected: true
					}]
					expertiseOrder.save().then((updatedExpertiseOrder: ExpertiseOrderModel) => resolve(updatedExpertiseOrder))
				}
			}).catch((error) => { reject(new HubbersBaseError(HBE040_NOT_FOUND, error)) })
	})
}

/**
 * User create expertise order attachment
 *
 * @param expertiseOrderId
 * @param newAttachment
 */
export const putExpertiseOrderAttachments = (expertiseOrderId: string, newAttachment: any) => {
	return new Promise < ExpertiseOrderModel > ((resolve, reject) => {
		ExpertiseOrderSchemaModel.findOneAndUpdate({
				_id: Types.ObjectId(expertiseOrderId)
			},
			{
				$push: {
					'briefData.attachments': newAttachment
				}
			}, {
				new: true
			}).then((expertiseOrder: any) => {
			if (!expertiseOrder) {
				reject(new HubbersBaseError(HBE040_NOT_FOUND))
			} else {
				resolve(expertiseOrder.briefData.attachments)
			}
		}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * User fetch expertise order attachment
 *
 * @param expertiseOrderId
 */
export const fetchAllExpertiseOrderAttachments = (expertiseOrderId: string) => {
	return new Promise < ExpertiseOrderModel > ((resolve, reject) => {
		ExpertiseOrderSchemaModel.find({
				_id: Types.ObjectId(expertiseOrderId)
			}).then((expertiseOrder: any) => {
			if (!expertiseOrder) {
				reject(new HubbersBaseError(HBE040_NOT_FOUND))
			} else {
				resolve(expertiseOrder[0].briefData.attachments)
			}
		}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/*
*  Admin  fetch expertise order  attachment
*/
export const adminFetchAllExpertiseOrderAttachments = (expertiseOrderId: string) => {
	return new Promise < ExpertiseOrderModel > ((resolve, reject) => {
		ExpertiseOrderSchemaModel.find({
			_id: Types.ObjectId(expertiseOrderId)
		}).then((expertiseOrder: any) => {
			if (!expertiseOrder) {
				reject(new HubbersBaseError(HBE040_NOT_FOUND))
			} else {
				resolve(expertiseOrder[0].briefData.attachments)
			}
		}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Admin create expertise order attachment
 *
 * @param expertiseOrderId
 * @param newAttachment
 */
export const adminPutExpertiseOrderAttachments = (expertiseOrderId: string, newAttachment: any) => {
	return new Promise < ExpertiseOrderModel > ((resolve, reject) => {

		ExpertiseOrderSchemaModel.findOneAndUpdate({
				_id: Types.ObjectId(expertiseOrderId)
			},
			{
				$push: {
					'briefData.attachments': newAttachment
				}
			}, {
				new: true
			}).then((expertiseOrder: any) => {
			if (!expertiseOrder) {
				reject(new HubbersBaseError(HBE040_NOT_FOUND))
			} else {
				resolve(expertiseOrder.briefData.attachments)
			}
		}).catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * User update expertise order attachment
 *
 * @param expertiseOrderId
 * @param attachmentId
 * @param bodyData
 */
export const updateAttachments = (expertiseOrderId: string, attachmentId: string, bodyData: any) => {
	return new Promise< ExpertiseOrderModel >((resolve, reject) => {
		const updateKeys = ['title', 'caption', 'previewUrl', 'fileType']
		const updatedObject = {}

		updateKeys.forEach((uk) => {
			if (bodyData.hasOwnProperty(uk)) {
				updatedObject['briefData.attachments.$.' + uk] = bodyData[uk]
			}
		})
		const update = {
			$set: updatedObject

		}

		ExpertiseOrderSchemaModel.findOneAndUpdate({
			'_id': Types.ObjectId(expertiseOrderId),
			'briefData.attachments._id': Types.ObjectId(attachmentId)
		}, update, {new: true})
			.then((expertiseOrder: any) => {
				if (!expertiseOrder) {
					reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE))
				} else {
					const getEntry = expertiseOrder.briefData.attachments.filter( attach => {

						return attach._id.toString() === attachmentId
					})

					resolve(getEntry)
				}

			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))

	})
}

/*
*  Admin update expertise order attachment
*/
export const adminUpdateAttachments = (expertiseOrderId: string, attachmentId: string, bodyData: any) => {
	return new Promise< ExpertiseOrderModel >((resolve, reject) => {
		const updateKeys = ['title', 'caption', 'previewUrl', 'fileType']
		const updatedObject = {}

		updateKeys.forEach((uk) => {
			if (bodyData.hasOwnProperty(uk)) {
				updatedObject['briefData.attachments.$.' + uk] = bodyData[uk]
			}
		})
		const update = {
			$set: updatedObject

		}

		ExpertiseOrderSchemaModel.findOneAndUpdate({
			'_id': Types.ObjectId(expertiseOrderId),
			'briefData.attachments._id': Types.ObjectId(attachmentId)
		}, update, {new: true})
			.then((expertiseOrder: any) => {
				if (!expertiseOrder) {
					reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE))
				} else {
					const getEntry = expertiseOrder.briefData.attachments.filter( attach => {

						return attach._id.toString() === attachmentId
					})

					resolve(getEntry)
				}

			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))

	})
}

/**
 * User fetch single expertise order attachment
 *
 * @param expertiseOrderId
 * @param attachmentId
 */
export const fetchSingleAttachments = (expertiseOrderId: string, attachmentId: string) => {
	return new Promise< ExpertiseOrderModel[] >((resolve, reject) => {

		ExpertiseOrderSchemaModel.find({
			_id: Types.ObjectId(expertiseOrderId)
		}).then((expertiseOrder: any) => {
				if (!expertiseOrder) {
					reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE))
				} else {
					const getEntry = expertiseOrder[0].briefData.attachments.filter( attach => {

						return attach._id.toString() === attachmentId
					})

					resolve(getEntry)
				}

			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))

	})
}

/**
 * Admin fetch single expertise order attachment
 *
 * @param expertiseOrderId
 * @param attachmentId
 */
export const adminFetchSingleAttachments = (expertiseOrderId: string, attachmentId: string) => {
	return new Promise< ExpertiseOrderModel[] >((resolve, reject) => {

		ExpertiseOrderSchemaModel.find({
			_id: Types.ObjectId(expertiseOrderId)
		}).then((expertiseOrder: any) => {
			if (!expertiseOrder) {
				reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE))
			} else {
				const getEntry = expertiseOrder[0].briefData.attachments.filter( attach => {

					return attach._id.toString() === attachmentId
				})

				resolve(getEntry)
			}

		}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))

	})
}

/**
 * Admin fetch expertise order
 *
 * @param expertiseId
 */
export const adminFetchExpertiseOrder = (expertiseId: string) => {
	return new Promise<ExpertiseOrderModel[]>((resolve, reject) => {
		ExpertiseOrderSchemaModel.find(
			{ expertise: Types.ObjectId(expertiseId) }).populate('project')
			.populate('expertise').populate('conversation')
			.then((foundExpertiseOrder: ExpertiseOrderModel[]) => {
				if (foundExpertiseOrder) { resolve(foundExpertiseOrder) } else { reject(new HubbersBaseError(HBE040_NOT_FOUND)) }
			}).catch((error) => { reject(new HubbersBaseError(HBE040_NOT_FOUND, error)) })
	})
}

export const adminUpdateExpertiseOrder = (expertiseId: string, orderId: string, briefData: any) => {
	return new Promise<ExpertiseOrderModel>((resolve, reject) => {
		ExpertiseOrderSchemaModel.findOneAndUpdate(
			{ _id: Types.ObjectId(orderId),  expertise: Types.ObjectId(expertiseId)  },
			{$set: briefData}, {new: true}).populate('expertise')
			.populate('expertise.selectedPackage').populate('conversation')
			.then((foundExpertiseOrder: ExpertiseOrderModel) => {
				resolve(foundExpertiseOrder)
				// if (foundExpertiseOrder) { resolve(foundExpertiseOrder) } else { reject(new HubbersBaseError(HBE040_NOT_FOUND)) }

			}).catch((error) => { reject(new HubbersBaseError( error)) })
	})
}

/**
 * Admin remove Expertise-Order
 *
 * @param expertiseId
 * @param orderId
 */
export const adminRemoveExpertiseOrder = (expertiseId: string, orderId: string) => {
	return new Promise<ExpertiseOrderModel>((resolve, reject) => {
		ExpertiseOrderSchemaModel.findOneAndRemove({ _id: orderId, expertise: expertiseId })
			.then((expertiseOrder: ExpertiseOrderModel) => {
				expertiseOrder ? resolve(expertiseOrder) : reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE))})
			.catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE)))
	})
}

/**
 * Admin Fetch Single expertise order
 *
 * @param expertiseId
 * @param orderId
 */
export const adminFetchSingleExpertiseOrder = (expertiseId: string, orderId: string) => {
	return new Promise< any >((resolve, reject) => {
		ExpertiseOrderSchemaModel.find({ _id: Types.ObjectId(orderId), expertise: Types.ObjectId(expertiseId)
		}).populate('expertise').populate('conversation').populate('project').then(async (expertiseOrder: any) => {
			if (expertiseOrder.length === 0 ) {
				resolve(expertiseOrder)
			} else {

				resolve(expertiseOrder)
			}
		}).catch((error: any) => reject(new HubbersBaseError( error)))
	})
}