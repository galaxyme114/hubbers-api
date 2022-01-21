import { ContestantParticipationModel, JudgeParticipationModel } from '../models/contest'
import { UserModel } from '../models/user'
import { UserRecord } from './user'

export interface ContestRecord {
	name: string
	shortId?: string
	slug: string
	featuredImageUrl: string
	description: string
	market: string
	rules: string
	startTime: any
	endTime: any
	numContestants: number
	numJudges: number
	prizes: any
	duration: number
	geography: string
	budget: number
	views: number
	likes: number[]
	innovationCategory: string
	productCategory: string
	shares: number
	allowJudgeSignup: boolean
	allowContestantSignup: boolean
	isDraft: boolean
	memberApplication: any
	contestants: [ContestantApplicationRecord | ContestantParticipationModel]
	judges: [JudgeApplicationRecord | JudgeParticipationModel]
	entries: any
	criteria?: any
}

export interface JudgeApplicationRecord {
	user: string | UserModel | UserRecord
	isActive: boolean
	currentRank?: number
	previousRank?: number
	createdAt?: string
	updatedAt?: string
}

export interface ContestantApplicationRecord {
	user: string | UserModel | UserRecord
	isActive: boolean
	currentRank?: number
	previousRank?: number
	createdAt?: string
	updatedAt?: string
}