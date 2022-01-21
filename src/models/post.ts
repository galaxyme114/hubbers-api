import { Document, Model, model, Schema} from 'mongoose'
import * as shortid from 'shortid'

import { PostRecord } from '../interfaces/posts'

const CommentSchema: Schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	body: String
}, {
	timestamps: true
})

export interface PostModel extends PostRecord, Document {}
export const PostSchema: Schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	shortId: {
		type: String,
		/* tslint:disable */
		'default': shortid.generate /* tslint:enable */
	},
	body: String,
	gallery: [String],
	tags: [String],
	comments: [CommentSchema],
	likes: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}], // Ids of all users who have liked the post
	isDraft: Boolean
}, {
	timestamps: true
})

export const PostSchemaModel: Model<PostModel> =
	model<PostModel>('Post', PostSchema)