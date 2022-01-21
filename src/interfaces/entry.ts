import { UserModel } from '../models/user'
import { UserRecord } from './user'

export interface EntryRecord {
	contest: any
	contestantId: number
	contestant: string | UserRecord | UserModel
	title: string
	descriptionDesign: string
	descriptionFunctionality: string
	descriptionUsability: string
	descriptionMarketPotential: string
	isDraft: boolean
	featuredImageUrl: string
	attachments: EntryAttachmentRecord[]
	ratings: EntryRatingRecord[]
}

export interface EntryAttachmentRecord {
	title: string
	caption: string
	previewUrl: string
}

export interface EntryRatingRecord {
	judgeId: number
	judge: string | UserRecord | UserModel
	average?: number
	design: number
	functionality: number
	usability: number
	marketPotential: number
	isSeen: boolean
	conversation: any
}