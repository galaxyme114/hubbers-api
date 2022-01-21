import { HBE003_FAILED_TO_FETCH } from '../constants/errors'
import {
	createExpertiseOrder, fetchExpertiseByIds, fetchExpertiseByShortId,
	fetchExpertiseOrder
} from '../controllers/expertise'
import { HubbersBaseError } from '../errors/index'
import { ExpertiseModel, ExpertiseSchemaModel } from '../models/expertise'
import { ExpertiseCategoryModel, ExpertiseCategorySchemaModel } from '../models/expertiseCategory'
import { ExpertiseOrderModel } from '../models/expertiseOrder'
import { slugify } from '../utils/stringUtils'

/**
 * Express route for fetching expertise categories
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const index = (req, res, next) => {
	ExpertiseCategorySchemaModel.find()
		.then((expertiseCategories: [ExpertiseCategoryModel]) => res.json(expertiseCategories))
		.catch(() => { next(new HubbersBaseError(HBE003_FAILED_TO_FETCH)) })
}