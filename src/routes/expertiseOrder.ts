import { check } from 'express-validator/check'
import { adminFetchAllExpertiseOrderAttachments, adminFetchExpertiseOrder, adminFetchSingleAttachments,
		adminFetchSingleExpertiseOrder, adminPutExpertiseOrderAttachments,
		adminRemoveExpertiseOrder, adminUpdateAttachments, 
		adminUpdateExpertiseOrder,
		fetchAllExpertiseOrderAttachments, fetchSingleAttachments,
		putExpertiseOrderAttachments, updateAttachments,
		updateExpertiseOrder } from '../controllers/expertiseOrder'
import { requestValidator } from '../middlewares/errorHandler'
import { ExpertiseOrderModel } from '../models/expertiseOrder'

import {filterObject} from '../utils/stringUtils'

import {HubbersBaseError} from '../errors'

import {HBE006_FAILED_TO_UPDATE} from '../constants/errors'

/**
 * Express route for updating an existing expertise order
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateMiddleware = [
	check('briefData').exists(), requestValidator
]
export const update = (req, res, next) => {
	const expertiseOrderId = req.params.expertiseOrderId
	const briefData = req.body.briefData

	updateExpertiseOrder(expertiseOrderId, req.user._id, briefData)
		.then((updatedExpertiseOrder: ExpertiseOrderModel) => res.json(updatedExpertiseOrder))
		.catch((error) => next(error))
}

/**
 * Express route for fetching an active expertise order
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetchOrder = (req, res, next) => {
	const expertiseId = req.params.expertiseId

	adminFetchExpertiseOrder(expertiseId)
		.then((expertiseOrder: ExpertiseOrderModel[]) => res.json(expertiseOrder))
		.catch(error => next(error))
}

/**
 * Express route for fetching an single expertise order
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetchSingleOrder = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const orderId = req.params.orderId

	adminFetchSingleExpertiseOrder(expertiseId, orderId)
		.then((expertiseOrder: ExpertiseOrderModel[]) => res.json(expertiseOrder))
		.catch(error => next(error))
}

/**
 * Express route for updating an existing expertise order
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
// export const updateMiddleware = [
// 	check('briefData').exists(), requestValidator
// ]
export const adminUpdateOrder = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const orderId = req.params.orderId

	const briefData = filterObject(req.body,
		['completed', 'project', 'expertise', 'selectedPackage', 'offers', 'conversation', 'briefData'])

	adminUpdateExpertiseOrder(expertiseId, orderId, briefData)
		.then((updatedExpertiseOrder: ExpertiseOrderModel) => res.json(updatedExpertiseOrder))
		.catch((error) => next(error))
}

/*
*  Express route for Admin remove or delete expertise order
* */
export const adminRemoveOrder = (req, res, next) => {
	const expertiseId = req.params.expertiseId
	const orderId = req.params.orderId

	adminRemoveExpertiseOrder(expertiseId, orderId)
		.then((expertiseOrder: ExpertiseOrderModel) => res.json(expertiseOrder))
		.catch(error => next(error))
}

/*
*	User  create expertise order  attachment
* */
export const expertiseOrderAttachments = (req, res, next) => {
	const expertiseOrderId = req.params.expertiseOrderId
	const attachments = req.body.attachments

	attachments.map(attach => filterObject(attach, ['title', 'caption', 'previewUrl', 'fileType']))
	putExpertiseOrderAttachments(expertiseOrderId, attachments)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError(error)))
}

/*
*	User  Fetch expertise order  attachment
* */
export const fetchExpertiseOrderAttachments = (req, res, next) => {
	const expertiseOrderId = req.params.expertiseOrderId

	fetchAllExpertiseOrderAttachments(expertiseOrderId)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError(error)))
}

/*
*	Amdin Fetch expertise order  attachment
* */
export const adminFetchExpertiseOrderAttachments = (req, res, next) => {
	const expertiseOrderId = req.params.expertiseOrderId

	adminFetchAllExpertiseOrderAttachments(expertiseOrderId)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError(error)))
}

/*
*	Admin  create expertise order  attachment
* */
export const adminExpertiseOrderAttachments = (req, res, next) => {
	const expertiseOrderId = req.params.expertiseOrderId
	const attachments = req.body.attachments

	attachments.map(attach => filterObject(attach, ['title', 'caption', 'previewUrl', 'fileType']))
	adminPutExpertiseOrderAttachments(expertiseOrderId, attachments)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError(error)))
}

/**
 * Express route for USer update expertise order  attachment
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updateExpertiseOrderAttachments = (req, res, next) => {

	const attachmentId = req.params.attachmentId
	const expertiseOrderId = req.params.expertiseOrderId
	const updateAttachmentData = filterObject(req.body,
		['title', 'caption', 'previewUrl', 'fileType'])

	updateAttachments(expertiseOrderId, attachmentId, updateAttachmentData)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError( HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Express route for Admin update expertise order  attachment
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminUpdateExpertiseOrderAttachments = (req, res, next) => {

	const attachmentId = req.params.attachmentId
	const expertiseOrderId = req.params.expertiseOrderId
	const updateAttachmentData = filterObject(req.body,
		['title', 'caption', 'previewUrl', 'fileType'])

	adminUpdateAttachments(expertiseOrderId, attachmentId, updateAttachmentData)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError( HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Express route for USer Get Single expertise order  attachment
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchSingleExpertiseOrderAttachments = (req, res, next) => {

	const attachmentId = req.params.attachmentId
	const expertiseOrderId = req.params.expertiseOrderId
	fetchSingleAttachments(expertiseOrderId, attachmentId)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError( HBE006_FAILED_TO_UPDATE, error)))
}

/**
 * Express route for Admin Get Single expertise order  attachment
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetchSingleExpertiseOrderAttachments = (req, res, next) => {

	const attachmentId = req.params.attachmentId
	const expertiseOrderId = req.params.expertiseOrderId
	adminFetchSingleAttachments(expertiseOrderId, attachmentId)
		.then(entry => res.json(entry))
		.catch(error => next(new HubbersBaseError( HBE006_FAILED_TO_UPDATE, error)))
}
