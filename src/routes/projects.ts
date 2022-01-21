import { check } from 'express-validator/check'
import { HBE003_FAILED_TO_FETCH } from '../constants/errors'
import {
	adminCreateProject, adminFetchAllProjects, adminFetchProject, adminFetchProjectBusinessNeeds,
	adminFetchSingleProjectBusinessNeeds,
	adminProjectUpdateBusinessNeeds, adminRemoveProjectBusinessNeeds, adminUpdateProject,
	createProject, fetchProjectBusinessNeeds, fetchProjectByShortId, fetchProjectOngoingTasks, fetchProjects,
	removeProject, updateProject
} from '../controllers/projects'
import { HubbersBaseError } from '../errors'
import { requestValidator } from '../middlewares/errorHandler'
import { ProjectModel } from '../models/project'
import { filterObject } from '../utils/stringUtils'

import {BusinessNeedsModel} from '../models/businessNeeds'

/**
 * Express route for fetching a list of projects
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const index = (req, res, next) => {
	const userId = req.user.id

	fetchProjects(userId)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express Admin route for fetching a list of projects
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const fetchAllProjects = (req, res, next) => {
	adminFetchAllProjects()
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express Admin route for fetching a list of projects
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const adminIndex = (req, res, next) => {
	const projectId = req.params.projectId
	console.log('projectId = ' + projectId)
	adminFetchProject(projectId)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for fetching a single project
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const fetch = (req, res, next) => {
	const userId = req.user.id
	const projectId = req.params.projectId

	fetchProjectByShortId(projectId, userId)
		.then(response => res.json(response))
		.catch(error => next(error))
}

/**
 * Express route for fetching a single project's ongoing tasks
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const fetchOngoingTasks = (req, res, next) => {
	const projectId = req.params.projectId
	const userId = req.user.id

	fetchProjectOngoingTasks(projectId, userId)
		.then((ongoingTasks: any) => res.json(ongoingTasks))
		.catch(() => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH)))
}

/**
 * Express route for fetching a single project's business needs
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const fetchBusinessNeeds = (req, res, next) => {
	const projectId = req.params.projectId

	fetchProjectBusinessNeeds(projectId)
		.then((businessNeeds) => res.json(businessNeeds))
		.catch(() => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH)))
}

/**
 * Express route for fetching a single project's business needs
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const adminFetchBusinessNeeds = (req, res, next) => {
	const projectId = req.params.projectId

	adminFetchProjectBusinessNeeds(projectId)
		.then((businessNeeds) => res.json(businessNeeds))
		.catch(() => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH)))
}

/**
 * Express route for fetching a single business need
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const adminFetchSingleBusinessNeeds = (req, res, next) => {
	const projectId = req.params.projectId
	const businessNeedId = req.params.id

	adminFetchSingleProjectBusinessNeeds(projectId, businessNeedId)
		.then((businessNeed: any) => res.json(businessNeed))
		.catch(error => next(error))
}


/**
 * Express route for updating a single project's data
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const update = (req, res, next) => {
	const userId = req.user.id
	const projectId = req.params.projectId
	const updatedProject = filterObject(req.body,
		['name', 'slug', 'featuredImageUrl', 'description', 'market', 'gallery',
			'productCategory', 'innovationCategory', 'geography', 'language', 'price', 'isDraft'])

	updateProject(userId, projectId, updatedProject)
		.then((project: ProjectModel) => res.json(project))
		.catch(error => next(error))
}

/**
 * Express route for creating a project
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const createMiddleware = [
	check('name').not().isEmpty(),
	requestValidator
]

export const create = (req, res, next) => {
	const userId = req.user.id
	const name = req.body.name

	createProject(userId, name)
		.then((project: ProjectModel) => res.json(project))
		.catch(error => next(error))
}

/**
 * Express route for creating a project
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const adminCreateMiddleware = [
	check('name').not().isEmpty(),
	requestValidator
]

export const adminCreate = (req, res, next) => {
	const userId = req.user.id
	const dataProject = filterObject(req.body,
		['name', 'state', 'featuredImageUrl', 'description', 'market', 'gallery',
			'productCategory', 'innovationCategory', 'geography', 'language', 'price', 'isDraft', 'shares'])
	adminCreateProject(userId, dataProject)
		.then((project: ProjectModel) => res.json(project))
		.catch(error => next(error))
}

/**
 * Express route for updating a single project's data
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const adminUpdate = (req, res, next) => {
	const projectId = req.params.projectId
	const updatedProject = filterObject(req.body,
		['name', 'slug', 'state', 'featuredImageUrl', 'description', 'market', 'gallery',
			'productCategory', 'innovationCategory', 'geography', 'language', 'price', 'isDraft', 'shares'])

	adminUpdateProject(projectId, updatedProject)
		.then((project: ProjectModel) => res.json(project))
		.catch(error => next(error))
}

/*
*  Express route for remove or delete project
* */
export const adminRemoveProject = (req, res, next) => {
	const projectId = req.params.projectId

	removeProject(projectId)
		.then((project: ProjectModel) => res.json(project))
		.catch(error => next(error))
}

/*
*  Express route for remove or delete Ongoing-Business-Needs Project's data
* */
export const adminRemoveBusinessNeeds = (req, res, next) => {
	const projectId = req.params.projectId
	const businessId = req.params.id

	adminRemoveProjectBusinessNeeds(projectId, businessId)
		.then((business: BusinessNeedsModel) => res.json(business))
		.catch(error => next(error))
}

/**
 * Express route for updating a Ongoing-Business-Needs Project's data
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next function to proceed with the middleware
 */
export const adminUpdateBusinessNeeds = (req, res, next) => {
	const businessId = req.params.id
	const projectId = req.params.projectId
	const updatedProject = filterObject(req.body,
		['tags', 'geography', 'project', 'userId', 'project', 'category',
			'description', 'budgetMin', 'budgetMax', 'bids'])

	adminProjectUpdateBusinessNeeds(projectId, businessId, updatedProject)
		.then((project: BusinessNeedsModel) => res.json(project))
		.catch(error => next(error))
}