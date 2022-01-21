import { Types } from 'mongoose'
import {
	HBE003_FAILED_TO_FETCH, HBE004_FAILED_TO_CREATE, HBE006_FAILED_TO_UPDATE,
	HBE040_NOT_FOUND
} from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { PostModel, PostSchemaModel } from '../models/post'
import { UserSchemaModel } from '../models/user'

/**
 * Fetch all posts
 */
export const fetchAllPosts = (userId: string) => {
	return new Promise<ReadonlyArray<PostModel>>((resolve, reject) => {
		PostSchemaModel.find({ isDraft: false }).sort({ createdAt: 'descending' }).limit(20).populate('user')
			.then(async (posts) => {
				Promise.all(posts.map(async (post: PostModel) => {
					// const user = await getAuthor(post.userId)
					return { ...post.toObject() }
				})).then((updatedPosts: ReadonlyArray<PostModel>) => resolve(updatedPosts))
			}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Admin Fetch all posts
 */
export const adminFetchAllPosts = (userId: string) => {
	return new Promise<ReadonlyArray<PostModel>>((resolve, reject) => {
		PostSchemaModel.find().sort({ createdAt: 'descending' }).limit(20).populate('user')
			.then(async (posts) => {
				Promise.all(posts.map(async (post: PostModel) => {
					return { ...post.toObject() }
				})).then((updatedPosts: ReadonlyArray<PostModel>) => resolve(updatedPosts))
			}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}


/**
 * fetch  posts by tags
 */
export const fetchPostByTags = (tags: string[]) => {
	return new Promise<ReadonlyArray<PostModel>>((resolve, reject) => {
		PostSchemaModel.find({tags: {$in: tags }}).sort({ createdAt: 'descending' }).populate('user')
			.then(async (posts) => {
				Promise.all(posts.map(async (post: PostModel) => {
					return { ...post.toObject() }
				})).then((updatedPosts: ReadonlyArray<PostModel>) => resolve(updatedPosts))
			}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Fetch single post
 */
export const fetchPost = (postId: string) => {
	return new Promise<PostModel>((resolve, reject) => {
		PostSchemaModel.findOne({ _id: postId }).populate('user').populate('comments.user')
			.then(async (post) => {
				if (post) {
					// const comments = await Promise.all(post.comments.map(async (comment: any) => {
					// 	const commentUser = await UserSchemaModel.findOne({_id: comment.userId})
					// 	return { ...comment.toObject(), user: commentUser }
					// }))
					resolve({ ...post.toObject() })
				} else {
					reject(new HubbersBaseError(HBE040_NOT_FOUND))
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 *  Admin Fetch single post
 */
export const adminFetchPost = (postId: string) => {
	return new Promise<PostModel>((resolve, reject) => {
		PostSchemaModel.findOne({ _id: postId }).populate('user').populate('comments.user')
			.then(async (post) => {
				if (post) { resolve(post) } else { reject(new HubbersBaseError(HBE040_NOT_FOUND)) }
			}).catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 *  Admin Update post
 */
export const adminPostUpdate = (postId: string, postData: any) => {
	return new Promise<PostModel>((resolve, reject) => {
		PostSchemaModel.findOneAndUpdate({
			_id: Types.ObjectId(postId)
		}, {
			$set: postData
		}, { new: true
		})
			.then((post: PostModel) => {
				if (!post) {
					reject(new HubbersBaseError(HBE040_NOT_FOUND))
				} else {
					resolve(post)
				}

			}).catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * Create a post
 */
export const createPost = (userId: string, body: string, gallery: string[], tags: string[]) => {
	return new Promise<PostModel>((resolve, reject) => {
		const post = new PostSchemaModel({ user: userId, body, gallery, tags, isDraft: true })
		post.save().then((savedPost: PostModel) =>
			savedPost ? resolve(savedPost) : reject(new HubbersBaseError(HBE040_NOT_FOUND)))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 *  Admin Create a post
 */
export const adminCreatePost = (userId: string, body: string, gallery: string[], tags: string[]) => {
	return new Promise<PostModel>((resolve, reject) => {
		const post = new PostSchemaModel({ user: userId, body, gallery, tags, isDraft: true })
		post.save().then((savedPost: PostModel) =>
			savedPost ? resolve(savedPost) : reject(new HubbersBaseError(HBE040_NOT_FOUND)))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH)))
	})
}

/**
 * Update post likes
 */
export const updatePostLikes = (userId: string, postId: string, liked: boolean) => {
	return new Promise<PostModel>((resolve, reject) => {
		const action = liked ? { $addToSet: { likes: userId } } : { $pullAll: { likes: [userId]} }

		PostSchemaModel.findOneAndUpdate({ _id: postId }, action,
			/* tslint:disable */ { 'new': true }) /* tslint:enable */
			.then((post) => resolve(post))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE)))
	})
}

/**
 * Create a post comment
 */
export const createPostComment = (userId: string, postId: string, body: string) => {
	return new Promise<PostModel>((resolve, reject) => {
		const comment = { user: userId, body, updatedAt: Date.now(), createdAt: Date.now() }

		PostSchemaModel.findOneAndUpdate({ _id: postId }, { $addToSet: { comments: comment } },
			/* tslint:disable */ { 'new': true, setDefaultsOnInsert: true }).populate('user') /* tslint:enable */
			.then(async (post) => {
				if (!post) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					// const user = await getAuthor(post.userId)
					const comments = await Promise.all(post.comments.map(async (newComment: any) => {
						// const commentUser = await getAuthor(newComment.userId)
						const commentUser = await UserSchemaModel.findOne({_id: newComment.userId})
						return { ...newComment.toObject(), user: commentUser }
					}))
					resolve({ ...post.toObject(), comments })
				}
			}).catch((error: any) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}

/**
 * Admin Create a post comment
 */
export const adminCreatePostComment = (userId: string, postId: string, body: string) => {
	return new Promise<PostModel>((resolve, reject) => {
		const comment = { user: userId, body, updatedAt: Date.now(), createdAt: Date.now() }

		PostSchemaModel.findOneAndUpdate({ _id: postId }, { $addToSet: { comments: comment } },
			/* tslint:disable */ { 'new': true, setDefaultsOnInsert: true })
			.populate('user').populate('comments.user') /* tslint:enable */
			.then(async (post) => {
				if (!post) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else { resolve(post) }
			}).catch((error: any) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}

/**
 * Create a post comment
 */
export const deletePostComment = (userId: string, postId: string, commentId: string) => {
	return new Promise<PostModel>((resolve, reject) => {
		PostSchemaModel.findOneAndUpdate({ _id: postId },
			{ $pull: { comments: { _id: commentId } } },
			/* tslint:disable */ { 'new': true }) /* tslint:enable */
			.then((post) => resolve(post))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE)))
	})
}

/**
 * Admin remove Posts comment
 */
export const adminDeletePostComment = (userId: string, postId: string, commentId: string) => {
	return new Promise<PostModel>((resolve, reject) => {
		PostSchemaModel.findOneAndUpdate({ _id: postId },
			{ $pull: { comments: { _id: commentId } } },
			/* tslint:disable */ { 'new': true }) /* tslint:enable */
			.then((post) => resolve(post))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Delete a post
 */
export const adminDeletePosts = (postId: string) => {
	return new Promise<PostModel>((resolve, reject) => {
		PostSchemaModel.findOneAndRemove({ _id: postId })
			.then((post) => resolve(post))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}