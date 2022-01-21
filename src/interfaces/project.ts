import { UserRecord } from './user'
import { UserModel } from '../models/user'

export interface ProjectRecord {
	shortId: string
	user: string | UserModel | UserRecord
	name: string
	slug: string
	featuredImageUrl: string
	gallery?: [string]
	description: string
	market: string
	category: string
	geography: string
	language: string
	price: number
	views: number
	shares: number
	isDraft: boolean
}