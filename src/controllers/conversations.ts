import { Types } from 'mongoose'
import { ConversationModel, ConversationSchemaModel } from '../models/conversation'
import {
	ConversationMessageModel,
	ConversationMessageSchemaModel
} from '../models/conversationMessage'

export interface ConversationPreviewModel extends ConversationModel {
	latestMessage: ConversationMessageModel
}

export interface ConversationMessagePreviewModel extends ConversationModel {
	conversation: ConversationModel
}

export interface ConversationDetailModel extends ConversationModel {
	messages: [ConversationMessageModel]
}

export const fetchAllConversations = (userId: string) => {
	return new Promise<[ConversationPreviewModel]>((resolve, reject) => {
		ConversationSchemaModel.find({ participants: userId }).populate('author').populate('participants')
			.then((conversations: ReadonlyArray<ConversationModel>) =>
				Promise.all(conversations.map(async (conversation: ConversationModel) => {
					const latestMessageQuery = await ConversationMessageSchemaModel
						.findOne({ conversation: conversation._id }).sort('-createdAt').limit(1)
					const latestMessage = latestMessageQuery ? latestMessageQuery.toObject() : latestMessageQuery
					// const authorAndPrimaryParticipant = await getAuthorAndPrimaryParticipant(
					// 	conversation.participants, conversation.authorId)

					return {...conversation.toObject(), latestMessage}
				})).then((updatedConversations: [ConversationPreviewModel]) => resolve(updatedConversations))
			).catch((error: any) => reject(error))
	})
}

export const fetchSingleConversation = (conversationId: number, userId: string) => {
	return new Promise<ConversationDetailModel>((resolve, reject) => {
		ConversationSchemaModel.findOne({ _id: Types.ObjectId(conversationId), participants: userId })
			.populate('author').populate('participants')
			.then((conversation: ConversationModel) => {

				if (conversation) {
					ConversationMessageSchemaModel.find({ conversation: conversation._id })
						.sort('-createdAt').limit(10)
						.then(async (conversationMessages: [ConversationMessageModel]) => {
							const messages = conversationMessages ?
								conversationMessages.map((mq: ConversationMessageModel) => mq.toObject()) : conversationMessages
							// const authorAndParticipants = await getAuthorAndParticipants(
							// 	conversation.participants, conversation.authorId)

							resolve({ ...conversation.toObject(), messages })
						}).catch((error: any) => reject(error))
				} else { reject() }
			}).catch((error: any) => reject(error))
	})
}

export const deleteSingleConversation = (conversationId: number, userId: string) => {
	return new Promise<ConversationModel>((resolve, reject) => {
		ConversationSchemaModel.findOne({ _id: Types.ObjectId(conversationId), participants: userId })
			.then((conversation: ConversationModel) => {
				if (conversation) {
					const participants = conversation.participants.filter((p: string) => p.toString() !== userId)
					const authorId = participants[0]

					return ConversationSchemaModel.findOneAndUpdate(
						{ _id: Types.ObjectId(conversationId) },
						{ $set: { participants, authorId} })
						.then((updatedConversation) => resolve(updatedConversation))
						.catch((error: any) => reject(error))
				} else { reject() }
			}).catch((error: any) => reject(error))
	})
}

export const createNewConversation = (conversationName: string, author: number, recipientIds: [number]) => {
	return new Promise<ConversationModel>((resolve, reject) => {
		const name = conversationName ? conversationName : Math.random().toString(36).substring(7)
		ConversationSchemaModel.findOneAndUpdate({ name },
			{ $set: { author, participants: recipientIds } },
			/* tslint:disable */
			{ upsert: true, 'new': true, setDefaultsOnInsert: true }) /* tslint:enable */
			.populate('author').populate('participants').then(async (conversation: ConversationModel) => {
				if (conversation) {
					// const authorAndParticipants = await getAuthorAndParticipants(
						// conversation.participants, conversation.authorId)
					resolve({ ...conversation.toObject() })
				} else { reject() }
			}).catch((error: any) => { reject(error) })

	})
}

export const createNewConversationMessage = (conversationId: string, authorId: number, message: string) => {
	return new Promise<ConversationMessageModel>((resolve, reject) => {
		const conversationMessage = new ConversationMessageSchemaModel({ conversation: conversationId, authorId, message })

		conversationMessage.save()
			.then(() => ConversationSchemaModel.populate(conversationMessage,
				{ path: 'conversation', populate: { path: 'author' } } ))
			.then(async (conversationPreviewMessage: ConversationMessagePreviewModel) => {
				if (conversationPreviewMessage.conversation) {
					// const authorAndParticipants = await getAuthorAndParticipants(
					// 	conversationPreviewMessage.conversation.participants, conversationPreviewMessage.authorId)
					resolve({ ...conversationPreviewMessage.toObject()})
				} else { reject() }
			}).catch(error => reject(error))
	})
}

/*
*   Express route for any user to participate in an existing conversation
* */
export const newParticipateToConversation = (conversationId: string, participateId: number) => {
	return new Promise((resolve, reject) => {
		ConversationSchemaModel.findOneAndUpdate({ _id: Types.ObjectId(conversationId) },
			{
				$push: {participants: participateId}
			},
			{
				/*  tslint: disable */
				new: true
				/*  tslint: enable  */
			}).populate('author').populate('participants').then((conversation: any) => {
			resolve(conversation)
		}).catch((error: any) => reject(error))
	})
}

/*
*     Express route  For any user to leave an existing conversation
* */
export const leaveParticipateFormConversation = (conversationId: string, participateId: number) => {
	return new Promise((resolve, reject) => {
		ConversationSchemaModel.findOneAndUpdate({ _id: Types.ObjectId(conversationId) },
			{
				$pull: {participants: participateId}
			},
			{
				/*  tslint: disable */
				new: true
				/*  tslint: enable  */
			}).populate('author').populate('participants').then((conversation: any) => {
			resolve(conversation)
		}).catch((error: any) => reject(error))
	})
}