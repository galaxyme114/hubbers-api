import { Document, Model, model, Schema} from 'mongoose'
import * as shortid from 'shortid'

import { ProjectRecord } from '../interfaces/project'
import { slugify } from '../utils/stringUtils'

/**
 * Roles : admin, editor, viewer
 * @type {"mongoose".Schema}
 */
const ProjectUserRole: Schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	role: String
}, { _id: false })

export interface ProjectModel extends ProjectRecord, Document {}
export const ProjectSchema: Schema = new Schema({
	shortId: {
		type: String,
		/* tslint:disable */'default': shortid.generate/* tslint:enable */
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	userRoles: [ProjectUserRole],
	name: String,
	slug: {
		type: String,
		/* tslint:disable */'default': ''/* tslint:enable */
	},
	state: {
		type: Number,
		/* tslint:disable */'default': 0/* tslint:enable */
	},
	featuredImageUrl: {
		type: String,
		/* tslint:disable */'default': ''/* tslint:enable */
	},
	gallery: [String],
	description: {
		type: String,
		/* tslint:disable */'default': ''/* tslint:enable */
	},
	market: {
		type: String,
		/* tslint:disable */'default': ''/* tslint:enable */
	},
	productCategory: {
		type: String,
		/* tslint:disable */'default': ''/* tslint:enable */
	},
	innovationCategory: {
		type: String,
		/* tslint:disable */'default': ''/* tslint:enable */
	},
	geography: {
		type: String,
		/* tslint:disable */'default': '--'/* tslint:enable */
	},
	language: {
		type: String,
		/* tslint:disable */'default': 'en'/* tslint:enable */
	},
	price: {
		type: Number,
		/* tslint:disable */'default': 0/* tslint:enable */
	},
	views: {
		type: Number,
		/* tslint:disable */'default': 0/* tslint:enable */
	},
	shares: {
		type: Number,
		/* tslint:disable */'default': 0/* tslint:enable */
	},
	isDraft: {
		type: Boolean,
		/* tslint:disable */'default': true/* tslint:enable */
	}
}, {
	timestamps: true
})

export const ProjectSchemaModel: Model<ProjectModel> =
	model<ProjectModel>('Project', ProjectSchema)