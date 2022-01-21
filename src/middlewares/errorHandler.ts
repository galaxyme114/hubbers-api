// Error handling middleware
import { validationResult } from 'express-validator/check'
import { HBE002_INCORRECT_PARAMETERS } from '../constants/errors'
import { HubbersBaseError } from '../errors'

export const requestValidator = (req, res, next) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		try {
			errors.throw()
		} catch (err) {
			throw new HubbersBaseError(HBE002_INCORRECT_PARAMETERS, err.mapped())
		}
	} else {
		next()
	}
}