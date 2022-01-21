import { Document, Model, model, Schema} from 'mongoose'
import { InviteContestant, InviteExpert, InviteExpertise, InviteJudge, InviteObserver } from '../interfaces/invite'

/**
 * Invitation Model for Experts
 *
 */
export interface InviteExpertModel extends InviteExpert, Document {}
export const InviteExpertSchema: Schema = new Schema({
	createdAt: Date,
	name: String,
	lastName: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	email: {
		type: String,
		unique: true
	},
	tags: [String]
})

export const InviteExpertSchemaModel: Model<InviteExpertModel> =
	model<InviteExpertModel>('InviteExpert', InviteExpertSchema)

/**
 * Invitation model for Expertise
 */
export interface InviteExpertiseModel extends InviteExpertise, Document {}
export const InviteExpertiseSchema: Schema = new Schema({
	createdAt: Date,
	name: {
		type: String,
		unique: true
	},
	tags: [String]
})

export const InviteExpertiseSchemaModel: Model<InviteExpertiseModel> =
	model<InviteExpertiseModel>('InviteExpertise', InviteExpertiseSchema)

/**
 * Invitation model for Observer
 */
export interface InviteObserverModel extends InviteObserver, Document {}
export const InviteObserverSchema: Schema = new Schema({
	createdAt: Date,
	name: String,
	lastName: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	email: {
		type: String,
		unique: true
	}
})

export const InviteObserverSchemaModel: Model<InviteObserverModel> =
	model<InviteObserverModel>('InviteObserver', InviteObserverSchema)

/**
 * Invitation model for Contestant
 */
export interface InviteContestantModel extends InviteContestant, Document {}
export const InviteContestantSchema: Schema = new Schema({
	createdAt: Date,
	name: String,
	lastName: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	email: {
		type: String,
		unique: true
	},
	contestId: Number
})

export const InviteContestantSchemaModel: Model<InviteContestantModel> =
	model<InviteContestantModel>('InviteContestant', InviteContestantSchema)

/**
 * Invitation model for Judge
 */
export interface InviteJudgeModel extends InviteJudge, Document {}
export const InviteJudgeSchema: Schema = new Schema({
	createdAt: Date,
	name: String,
	lastName: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	email: {
		type: String,
		unique: true
	},
	contestId: Number
})

export const InviteJudgeSchemaModel: Model<InviteJudgeModel> =
	model<InviteJudgeModel>('InviteJudge', InviteJudgeSchema)