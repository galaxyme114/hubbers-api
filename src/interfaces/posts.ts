export interface PostRecord {
	user: string
	shortId: string
	description: string
	tags: string[]
	gallery: string[]
	comments: CommentRecord[]
}

export interface CommentRecord {
	user: string
	body: string
}