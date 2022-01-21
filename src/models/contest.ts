import { Document, Model, model, Schema } from 'mongoose'
import * as shortid from 'shortid'

import { ContestantApplicationRecord, ContestRecord, JudgeApplicationRecord } from '../interfaces/contest'
import { EntrySchema } from './entry'

/**
 * Contest Model
 */
export interface ContestantParticipationModel extends ContestantApplicationRecord, Document {}
export const ContestantParticipantSchema: Schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	id: {
		type: Number
	},
	isActive: {
		type: Boolean,
		/* tslint:disable */
		default: false /* tslint:enable  */
	},
	currentRank: {
		type: Number,
		/* tslint:disable */
		default: 0 /* tslint:enable  */
	},
	previousRank: {
		type: Number,
		/* tslint:disable */
		default: 0 /* tslint:enable  */
	}
}, {
	timestamps: true
})

export interface JudgeParticipationModel extends JudgeApplicationRecord, Document {}
export const JudgeParticipantSchema: Schema = new Schema({
	id: {
		type: Number
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	isActive: {
		type: Boolean,
		/* tslint:disable */
		default: false /* tslint:enable  */
	}
}, {
	timestamps: true
})

export const CriteriaSchema: Schema = new Schema({
	title: String,
	body: String
}, {
	timestamps: true
})

export const PrizesSchema: Schema = new Schema({
	id: Number,
	name: String,
	standing: Number,
	contestId: Number,
	description: String,
	prize: Number,
	currency: String,
	royalty: Number
}, {
	timestamps: true
})

export interface ContestModel extends ContestRecord, Document {}
export const ContestSchema: Schema = new Schema({
	shortId: {
		type: String,
		/* tslint:disable */
		'default': shortid.generate /* tslint:enable */
	},
	name: {
		type: String,
		required: true
	},
	slug: {
		type: String
	},
	featuredImageUrl: {
		type: String
	},
	description: {
		type: String
	},
	market: {
		type: String
	},
	rules: {
		type: String
	},
	productCategory: {
		type: String
	},
	innovationCategory: {
		type: String
	},
	duration: {
		type: Number,
		/* tslint:disable */
		'default': 40 /* tslint:enable */
	},
	geography: {
		type: String,
		/* tslint:disable */
		'default': '--' /* tslint:enable */
	},
	prizes: [PrizesSchema],
	budget: {
		type: Number
	},
	views: {
		type: Number,
		/* tslint:disable */
		'default': 0 /* tslint:enable */
	},
	shares: {
		type: Number,
		/* tslint:disable */
		'default': 0 /* tslint:enable */
	},
	// likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	likes: [{ type: String }],
	allowJudgeSignup: {
		type: Boolean,
		/* tslint:disable */
		'default': true /* tslint:enable */
	},
	allowContestantSignup: {
		type: Boolean,
		/* tslint:disable */
		'default': true/* tslint:enable */
	},
	isDraft: {
		type: Boolean
	},
	startTime: {
		type: Date,
		/* tslint:disable */
		'default': Date.now /* tslint:enable */
	},
	endTime: {
		type: String
	},
	numJudges: {
		type: Number
	},
	numContestants: {
		type: Number
	},
	contestants: [ContestantParticipantSchema],
	judges: [JudgeParticipantSchema],
	entries: [EntrySchema],
	criteria: [CriteriaSchema]
}, {
	timestamps: true
})

ContestSchema.pre('init', (doc: any) => {
	if (doc.startTime && doc.duration) {
		const startDate = new Date(doc.startTime)
		startDate.setDate(startDate.getDate() + doc.duration)
		doc.endTime = startDate.toISOString()
	}
})

ContestSchema.pre('init', (doc: any) => {
	if (doc.judges.length !== 0) {
		const judges = doc.judges.filter(j => j.isActive === true)
		doc.numJudges = judges.length
	} else {
		doc.numJudges = doc.judges.length
	}
	
	if (doc.contestants.length !== 0) {
		const contestants = doc.contestants.filter(j => j.isActive === true)
		doc.numContestants = contestants.length
	} else {
		doc.numContestants = doc.contestants.length
	}
})

export const ContestSchemaModel: Model<ContestModel> = model<ContestModel>('Contest', ContestSchema)