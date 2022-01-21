import {
	HBE003_FAILED_TO_FETCH,
	HBE006_FAILED_TO_UPDATE,
	HBE007_FAILED_TO_DELETE,
	HBE040_NOT_FOUND
} from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { ProjectRecord } from '../interfaces/project'
import { BusinessNeedsModel, BusinessNeedsSchemaModel } from '../models/businessNeeds'
import { ExpertiseOrderSchemaModel } from '../models/expertiseOrder'
import { ProjectModel, ProjectSchemaModel } from '../models/project'
import { slugify } from '../utils/stringUtils'

/**
 * Fetch all projects for a user
 *
 * @param {string} userId
 * @param {string} role
 * @returns {Promise<ReadonlyArray<ProjectModel>>}
 */
export const fetchProjects = (userId: string, role?: string) => {
	return new Promise<ReadonlyArray<ProjectModel>>((resolve, reject) => {
		const query = role ? { 'userRoles.user': userId, 'userRoles.role': role } : { 'userRoles.user': userId }

		ProjectSchemaModel.find(query).populate('user')
			.then((projects: ReadonlyArray<ProjectModel>) => resolve(projects))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Fetch a single project
 *
 * @param {string} projectId
 * @param {string} userId
 * @param {string} role
 * @returns {Promise<ProjectModel>}
 */
export const fetchProject = (projectId: string, userId: string, role?: string) => {
	return new Promise<ProjectModel>((resolve, reject) => {
		const query = role ? { 'userRoles.user': userId, 'userRoles.role': role } : { 'userRoles.user': userId }

		ProjectSchemaModel.findOne({ _id: projectId, ...query }).populate('user')
			.then((project: ProjectModel) => resolve(project))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH)))
	})
}

/**
 * Fetch a single project by short id
 *
 * @param {string} projectShortId
 * @param {string} userId
 * @param {string} role
 * @returns {Promise<ProjectModel>}
 */
export const fetchProjectByShortId = (projectShortId: string, userId: string, role?: string) => {
	return new Promise<ProjectModel>((resolve, reject) => {
		const query = role ? { 'userRoles.user': userId, 'userRoles.role': role } : { 'userRoles.user': userId }

		ProjectSchemaModel.findOne({ shortId: projectShortId, ...query })
			.then((project: ProjectModel) => resolve(project))
			.catch((error: any) => reject(new HubbersBaseError(HBE040_NOT_FOUND, error)))
	})
}

/**
 * Create a project
 *
 * @param {string} userId
 * @param {string} name
 */
export const createProject = (userId: string, name: string) => {
	return new Promise<ProjectModel>(async (resolve, reject) => {
		try {
			const project = new ProjectSchemaModel({
				name, slug: slugify(name), user: userId, userRoles: [{ user: userId, role: 'creator' }]
			})
			await project.save()
			resolve(project)
		} catch (error) {
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
		}
	})
}

/**
 * Admin Create a project
 *
 * @param {string} userId
 * @param projectData
 */
export const adminCreateProject = (userId: string, projectData: Partial<ProjectRecord>) => {
	return new Promise<ProjectModel>(async (resolve, reject) => {
		try {
			const project = new ProjectSchemaModel({
				...projectData, slug: slugify(projectData.name), user: userId, userRoles: [{ user: userId, role: 'creator' }]
			})
			await project.save()
			resolve(project)
		} catch (error) {
			reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error))
		}
	})
}

/**
 * Update a project
 *
 * @param {string} userId
 * @param {string} projectId
 * @param {ProjectRecord} updatedProject
 */
export const updateProject = (userId: string, projectId: string, updatedProject: Partial<ProjectRecord>) => {
	return new Promise<ProjectModel>((resolve, reject) => {
		return ProjectSchemaModel.findOneAndUpdate({ _id: projectId }, updatedProject,
			/* tslint:disable */{ 'new': true } /* tslint:enable */)
			.then((project: ProjectModel) => resolve(project))
			.catch((error: any) => { reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)) })
	})
}

/**
 * Fetch the ongoing tasks of a project
 *
 * @param {string} projectId
 * @param {string} userId
 * @returns {Promise<string[]>}
 */
export const fetchProjectOngoingTasks = (projectId: string, userId: string) => {
	return new Promise<string[]>((resolve, reject) => {
		ExpertiseOrderSchemaModel.find({ project: projectId, user: userId }, 'expertise')
			.then((expertise: any) => {
				if (expertise) {
					resolve(expertise.map(e => e.expertise))
				} else {
					reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH))
				}
			}).catch((error: any) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

/**
 * Fetch the ongoing business needs for a project
 *
 * @param {string} projectId
 * @returns {Promise<BusinessNeedsModel[]>}
 */
export const fetchProjectBusinessNeeds = (projectId: string) => {
	return new Promise<BusinessNeedsModel[]>((resolve, reject) => {
		BusinessNeedsSchemaModel.find({ project: projectId })
			.populate('project').populate('category')
			.then((businessNeeds: BusinessNeedsModel[]) => resolve(businessNeeds))
			.catch((error: any) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

/**
 * ADMIN Fetch the ongoing business needs for a project
 *
 * @param {string} projectId
 * @returns {Promise<BusinessNeedsModel[]>}
 */
export const adminFetchProjectBusinessNeeds = (projectId: string) => {
	return new Promise<BusinessNeedsModel[]>((resolve, reject) => {
		BusinessNeedsSchemaModel.find({ project: projectId })
			.populate('project').populate('category')
			.then((businessNeeds: BusinessNeedsModel[]) => resolve(businessNeeds))
			.catch((error: any) => { reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
	})
}

export const adminFetchSingleProjectBusinessNeeds = (projectId: string, businessNeedsId: string) => {
	return new Promise<BusinessNeedsModel>((resolve, reject) => {
		BusinessNeedsSchemaModel.findOne({ _id: businessNeedsId, project: projectId })
			.populate('project').populate('category')
			.then((foundBusinessNeed) => {
				if (!foundBusinessNeed) { reject(new HubbersBaseError(HBE040_NOT_FOUND)) } else {
					resolve(foundBusinessNeed)
				}
			}).catch((error) => { reject(new HubbersBaseError(HBE040_NOT_FOUND, error)) })
	})
}

/**
 * Admin Update a Ongoing-Business-Needs Project
 *
 * @param {string} projectId
 * @param {string} businessNeedsId
 * @param {ProjectRecord} updatedBusinessNeeds
 */
export const adminProjectUpdateBusinessNeeds = (
	projectId: string, businessNeedsId: string, updatedBusinessNeeds: any) => {
	return new Promise<BusinessNeedsModel>((resolve, reject) => {
		BusinessNeedsSchemaModel.findOneAndUpdate({ _id: businessNeedsId, project: projectId }, updatedBusinessNeeds,
			/* tslint:disable */{ 'new': true } /* tslint:enable */)
			.then((project: BusinessNeedsModel) => resolve(project))
			.catch((error: any) => { reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)) })
	})
}

/**
 * Admin Fetch all projects of user
 *
 * @returns {Promise<ReadonlyArray<ProjectModel>>}
 */
export const adminFetchAllProjects = () => {
	return new Promise<ReadonlyArray<ProjectModel>>((resolve, reject) => {

		ProjectSchemaModel.find({})
			.populate('user')
			.then(async (projects: ReadonlyArray<ProjectModel>) => resolve(projects))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH)))
	})
}

/**
 * Admin Fetch a single project
 *
 * @param {string} projectId
 * @returns {Promise<ProjectModel>}
 */
export const adminFetchProject = (projectId: string) => {
	return new Promise<ProjectModel>((resolve, reject) => {

		ProjectSchemaModel.findOne({ _id: projectId })
			.populate('user')
			.then(async (project: ProjectModel) => resolve(project))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Admin Update a project
 *
 * @param {string} projectId
 * @param {ProjectRecord} updatedProject
 */
export const adminUpdateProject = (projectId: string, updatedProject: Partial<ProjectRecord>) => {
	return new Promise<ProjectModel>((resolve, reject) => {
		ProjectSchemaModel.findOneAndUpdate({ _id: projectId }, updatedProject,
			/* tslint:disable */{ 'new': true } /* tslint:enable */)
			.then((project: ProjectModel) => resolve(project))
			.catch((error: any) => { reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)) })
	})
}

/**
 * Admin remove project
 *
 * @param projectId
 */
export const removeProject = (projectId: string) => {
	return new Promise<ProjectModel>((resolve, reject) => {
		ProjectSchemaModel.findOneAndRemove({ _id: projectId })
			.then((project: ProjectModel) => {
				project ? resolve(project) : reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE))})
			.catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
	})
}

/**
 * Admin delete ongoing business needs
 *
 * @param projectId
 * @param businessNeedsId
 */
export const adminRemoveProjectBusinessNeeds = (projectId: string, businessNeedsId: string) => {
	return new Promise<BusinessNeedsModel>((resolve, reject) => {
		BusinessNeedsSchemaModel.findOneAndRemove({ _id: businessNeedsId , project: projectId})
			.then((project: BusinessNeedsModel) => {
				project ? resolve(project) : reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE))})
			.catch(error => reject(new HubbersBaseError(HBE007_FAILED_TO_DELETE, error)))
	})
}