import { Currency } from '../constants/enums'
import { ConversationRecord } from './conversation'
import { ExpertRecord } from './expert'
import { Purchasable } from './purchaseOrder'
import { UserRecord } from './user'

export interface PackageRecord {
	id: number
	name: string
	price: number
	currency: Currency
	description: string
	availability: string
	delivery: number
}

export interface AttachmentRecord {
	title: string
	caption: string
	previewUrl: string
}


export interface BriefDataRecord {
	nda: string
	attachments: [AttachmentRecord]
	additionalInfo: string
	fields: [{
		name: string
		value: string
	}]
	version: number
}

export interface OfferRecord {
	name: string
	currency: string
	breakdown: [{
		name: string
		delivery: number
		price: number
		selected: boolean
	}]
	selected: boolean
}

export interface ExpertiseRecord {
	shortId: string
	featuredImageUrl: string
	gallery?: [string]
	name: string
	slug: string
	rating: number
	reviews?: any
	tags?: string
	about: string
	isDraft?: boolean
	category: any
	user: UserRecord
	packages?: ReadonlyArray<PackageRecord>
}

export interface ExpertiseOrderRecord extends Purchasable {
	user: string
	expertise: ExpertiseRecord
	briefData: BriefDataRecord
	offers: [OfferRecord]
	conversation: ConversationRecord
}

export interface ExpertiseCategoryRecord {
	name: string
	slug: string
	description: string
	icon: string
}