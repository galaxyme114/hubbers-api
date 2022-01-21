import axios from 'axios'
import { HBE003_FAILED_TO_FETCH } from '../constants/errors'
import { HubbersBaseError } from '../errors/index'

/**
 * Express route for fetching KPI
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const index = (req, res, next) => {
	axios.get(process.env.KPI_API)
		.then(response => 	res.json(response.data))
		.catch(() => { next(new HubbersBaseError(HBE003_FAILED_TO_FETCH)) })
}