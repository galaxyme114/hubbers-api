
export interface ConversationRecord {
	participants: string[]
	authorId: number
}

export interface ConversationMessageRecord {
	conversation: string
	message: string
	authorId: number
}