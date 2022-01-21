import { check } from 'express-validator/check'
import {
	adminCreatePost, adminCreatePostComment, adminDeletePostComment, adminDeletePosts,
	adminFetchAllPosts, adminFetchPost, adminPostUpdate, createPost,
	createPostComment,
	deletePostComment, fetchAllPosts,
	fetchPost, fetchPostByTags, updatePostLikes
} from '../controllers/posts'
import { requestValidator } from '../middlewares/errorHandler'
import {filterObject} from '../utils/stringUtils'

/**
 * Express route for fetching a list of post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const index = (req, res, next) => {
	fetchAllPosts(req.user._id)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express route for Admin fetching a list of post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminIndex = (req, res, next) => {
	adminFetchAllPosts(req.user._id)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express route for fetching a single post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetch = (req, res, next) => {
	const postId = req.params.postId

	fetchPost(postId)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}


/**
 * Express route for fetching the post by tags
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetchByTags = (req, res, next) => {
	const tags = req.params.tags;

	fetchPostByTags([tags])
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express route for Admin fetching a single post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetch = (req, res, next) => {
	const postId = req.params.postId

	adminFetchPost(postId)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

/**
 * Express route for creating a new post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const createMiddleware = [
	check('body').exists(),
	check('gallery').exists(), requestValidator
]
export const create = (req, res, next) => {
	const body = req.body.body
	const gallery = req.body.gallery
	const tags = req.body.tags


	createPost(req.user._id, body, gallery, tags)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}

export const adminCreateMiddleware = [
	check('body').exists(), check('gallery').exists(), requestValidator
]
export const adminCreate = (req, res, next) => {
	const body = req.body.body
	const gallery = req.body.gallery
	const tags = req.body.tags

	adminCreatePost(req.user._id, body, gallery, tags)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}


/**
 * Express route for updating a post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
// export const update = (req, res, next) => {}

/**
 * Express route for deleting a post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
// export const remove = (req, res, next) => {}

/**
 * Express route for liking a single post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const updatePostLikeMiddleware = [
	check('like').exists(), check('like').isBoolean(), requestValidator
]
export const like = (req, res, next) => {
	const postId = req.params.postId
	const liked = req.body.like
	const userId = req.user._id

	updatePostLikes(userId, postId, liked === 'true')
		.then((response) => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for create a comment
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const createComment = (req, res, next) => {
	const postId = req.params.postId
	const userId = req.user._id
	const commentBody = req.body.body

	createPostComment(userId, postId, commentBody)
		.then((response) => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for admin create a comment
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminCreateComment = (req, res, next) => {
	const postId = req.params.postId
	const userId = req.user._id
	const commentBody = req.body.body

	adminCreatePostComment(userId, postId, commentBody)
		.then((response) => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for updating a comment
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
// export const updateComment = (req, res, next) => {}

/**
 * Express route for deleting a comment
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const deleteComment = (req, res, next) => {
	const postId = req.params.postId
	const commentId = req.params.commentId
	const userId = req.user._id

	deletePostComment(userId, postId, commentId)
		.then((response) => res.json(response))
		.catch(error => next(error))
}


/**
 * Express route for Admin deleting a comment
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminDeleteComment = (req, res, next) => {
	const postId = req.params.postId
	const commentId = req.params.commentId
	const userId = req.user._id

	adminDeletePostComment(userId, postId, commentId)
		.then((response) => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for deleting a post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminDeletePost = (req, res, next) => {
	const postId = req.params.postId

	adminDeletePosts(postId)
		.then((response) => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for creating a new post
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminUpdateMiddleware = [
	check('body').exists(), check('gallery').exists(), requestValidator
]
export const adminUpdate = (req, res, next) => {
	const postId = req.params.postId

	const postData = filterObject(req.body,
		['body', 'gallery', 'comments', 'likes', 'tags', 'isDraft'])

	adminPostUpdate(postId, postData)
		.then(response => res.json(response))
		.catch((error: any) => { next(error) })
}