import { UserModel } from '../models/user'
import { UserRecord } from './user'

export interface CommunityRecord {
    shortId?: string
    country: string
    city: string
    facilitators: [UserLocationRecord]
    featuredImageUrl?: string
    numConsultants: string
    socialMediaTags: string[]
    tags: string[]
    partners: string[]
}

export interface UserLocationRecord {
    availability: string
    user: string | UserRecord | UserModel
}

export interface BlogsRecord {
    _id?: string
    title: string
    description: string
    author: string
    link: string
    category: string[]
    featuredImageUrl?: string[]
    content: string
    createdAt: string
}
