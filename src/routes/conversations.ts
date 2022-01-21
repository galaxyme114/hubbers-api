import { check } from 'express-validator/check'
import { HBE003_FAILED_TO_FETCH, HBE004_FAILED_TO_CREATE, HBE007_FAILED_TO_DELETE } from '../constants/errors'
import {
	ConversationDetailModel,
	ConversationPreviewModel,
	createNewConversation,
	createNewConversationMessage, deleteSingleConversation,
	fetchAllConversations,
	fetchSingleConversation,
	leaveParticipateFormConversation,
	newParticipateToConversation
} from '../controllers/conversations'
import { HubbersBaseError } from '../errors'
import { userAuthenticator } from '../middlewares/authenticator'
import { requestValidator } from '../middlewares/errorHandler'
import { ConversationModel } from '../models/conversation'

/**
 * Express route for fetching all conversations
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchMiddleware = [
	userAuthenticator
]
export const fetch = (req, res, next) => {
	fetchAllConversations(req.user._id)
		.then((conversations: ReadonlyArray<ConversationPreviewModel>) => res.json(conversations))
		.catch((error) => {
			next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
		})
}

/**
 * Express route for creating a new conversation
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const createMiddleware = [
	check('recipientIds'), requestValidator, userAuthenticator
]
export const create = (req, res, next) => {
	const conversationName = req.body.name
	const recipientIds = req.body.recipientIds
	createNewConversation(conversationName, req.user.id, recipientIds)
		.then((conversation: ConversationModel) => res.json(conversation))
		.catch((error) => {
			next(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
		})
}

/**
 * Express route for getting all messages
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchConversationMiddleware = [
	userAuthenticator
]
export const fetchConversation = (req, res, next) => {
	const conversationId = req.params.conversationId

	fetchSingleConversation(conversationId, req.user.id)
		.then((conversation: ConversationDetailModel) => res.json(conversation))
		.catch((error) => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Express route for creating a new conversation message
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const createMessageMiddleware = [
	check('message'), requestValidator, userAuthenticator
]
export const createMessage = (req, res, next) => {
	const conversationId = req.params.conversationId
	const message = req.body.message

	createNewConversationMessage(conversationId, req.user.id, message)
		.then(response => {
			res.json(response)
			res.app.emit('conversationMessage:new', response)
		}).catch((error) => {
		next(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
	})
}

/**
 * Express route for any user to participate in an existing conversation
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const participateToConversation = (req, res, next) => {

	const conversationId = req.params.conversationId
	const participateId = req.user.id

	newParticipateToConversation(conversationId, participateId)
		.then(response => {
			res.json(response)
		}).catch((error) => {
		next(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error))
	})
}

/**
 * Express route  For any user to leave an existing conversation
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const participateLeaveConversation = (req, res, next) => {

	const conversationId = req.params.conversationId
	const participateId = req.user.id

	leaveParticipateFormConversation(conversationId, participateId)
		.then(response => {
			res.json(response) })
		.catch((error) => next(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
}

/**
 * Express route for deleting a single conversation by removing the user as a participant
 *
 * TODO: Find a better way to reference an existing participant in the future
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const deleteConversationMiddleware = [
	userAuthenticator
]
export const deleteConversation = (req, res, next) => {
	const conversationId = req.params.conversationId

	deleteSingleConversation(conversationId, req.user.id)
		.then((conversation: ConversationDetailModel) => res.json(conversation))
		.catch((error) => next(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
}