import { sendPushNotification } from '../utils/pushNotificationClient'

export const newConversationMessage = (conversationMessage: any) => {
	const authorName = conversationMessage.author.name
	const nonAuthorParticipants = conversationMessage.participants.filter(
		(p: any) => p.id !== conversationMessage.authorId)
	const nonAuthorParticipantIds = nonAuthorParticipants.map((nap: any) => nap.id)

	return sendPushNotification(nonAuthorParticipantIds, {
		title: authorName ? authorName + ' just sent you a message' : 'New Message',
		body: trimConversationPreview(conversationMessage.message),
		payload: {
			key: 'conversation',
			keyId: conversationMessage.id
		}
	})
}

const trimConversationPreview = (message: string) => {
	return message.substring(0, 120)
}