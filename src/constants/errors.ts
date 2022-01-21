// Listing of all commonly used errors

interface HubbersBaseError {
	code: string,
	name: string,
	message: string,
	status: number
}

type HBE001_INVALID_REQUEST = HubbersBaseError
type HBE002_INCORRECT_PARAMETERS = HubbersBaseError
type HBE003_FAILED_TO_FETCH = HubbersBaseError
type HBE004_FAILED_TO_CREATE = HubbersBaseError
type HBE005_ALREADY_EXISTS = HubbersBaseError
type HBE006_FAILED_TO_UPDATE = HubbersBaseError
type HBE007_FAILED_TO_DELETE = HubbersBaseError
type HBE010_NOT_AUTHENTICATED = HubbersBaseError
type HBE011_FAILED_TO_LOGIN = HubbersBaseError
type HBE012_FAILED_TO_REGISTER = HubbersBaseError
type HBE013_ALREADY_REGISTERED = HubbersBaseError
type HBE014_FAILED_TO_DELIVER = HubbersBaseError
type HBE015_FAILED_TO_VERIFY = HubbersBaseError
type HBE016_USER_SESSION_EXPIRED = HubbersBaseError
type HBE017_NOT_AUTHORIZED = HubbersBaseError
type HBE040_NOT_FOUND = HubbersBaseError
type HBE041_INVITATION_NOT_FOUND = HubbersBaseError

export const HBE001_INVALID_REQUEST: HBE001_INVALID_REQUEST = {
	code: '001', name: 'Invalid Request', message: 'Invalid Request', status: 422
}

export const HBE002_INCORRECT_PARAMETERS: HBE002_INCORRECT_PARAMETERS = {
	code: '002', name: 'Incorrect Request Parameters', message: 'Incorrect Request Parameters', status: 422
}

export const HBE003_FAILED_TO_FETCH: HBE003_FAILED_TO_FETCH = {
	code: '003', name: 'Failed to fetch', message: 'Failed to fetch the requested resource', status: 400
}

export const HBE004_FAILED_TO_CREATE: HBE004_FAILED_TO_CREATE = {
	code: '004', name: 'Failed to create', message: 'Failed to create the requested resource', status: 400
}

export const HBE005_ALREADY_EXISTS: HBE005_ALREADY_EXISTS = {
	code: '005', name: 'Already Exists', message: 'Resource already exists', status: 400
}

export const HBE006_FAILED_TO_UPDATE: HBE006_FAILED_TO_UPDATE = {
	code: '006', name: 'Failed to update', message: 'Failed to update the requested resource', status: 400
}

export const HBE007_FAILED_TO_DELETE: HBE007_FAILED_TO_DELETE = {
	code: '007', name: 'Failed to delete', message: 'Failed to delete the requested resource', status: 400
}

export const HBE010_NOT_AUTHENTICATED: HBE010_NOT_AUTHENTICATED = {
	code: '010', name: 'User not authenticated', message: 'User is not authenticated', status: 401
}

export const HBE011_FAILED_TO_LOGIN: HBE011_FAILED_TO_LOGIN = {
	code: '011', name: 'Failed to login', message: 'Failed to login', status: 401
}

export const HBE012_FAILED_TO_REGISTER: HBE012_FAILED_TO_REGISTER = {
	code: '012', name: 'Failed to register', message: 'Failed to register', status: 401
}

export const HBE013_ALREADY_REGISTERED: HBE013_ALREADY_REGISTERED = {
	code: '013', name: 'Already registered', message: 'This email has already been taken', status: 401
}

export const HBE014_FAILED_TO_DELIVER: HBE014_FAILED_TO_DELIVER = {
	code: '014', name: 'Failed to deliver', message: 'Failed to deliver the requested resource', status: 401
}

export const HBE015_FAILED_TO_VERIFY: HBE015_FAILED_TO_VERIFY = {
	code: '015', name: 'Failed to verify', message: 'Failed to verify', status: 401
}

export const HBE016_USER_SESSION_EXPIRED: HBE016_USER_SESSION_EXPIRED = {
	code: '016', name: 'Session Expired', message: 'User session has expired', status: 401
}

export const HBE017_NOT_AUTHORIZED: HBE017_NOT_AUTHORIZED = {
	code: '017', name: 'Not Authorized', message: 'User not authorized', status: 401
}

export const HBE040_NOT_FOUND: HBE040_NOT_FOUND = {
	code: '040', name: 'Not Found', message: 'Requested resource not found', status: 404
}

export const HBE041_INVITATION_NOT_FOUND: HBE041_INVITATION_NOT_FOUND = {
	code: '041', name: 'Invitation not found', message: 'Invitation code is not valid', status: 404
}

export type HubbersErrorType =
	| HBE001_INVALID_REQUEST
	| HBE002_INCORRECT_PARAMETERS
	| HBE003_FAILED_TO_FETCH
	| HBE004_FAILED_TO_CREATE
	| HBE005_ALREADY_EXISTS
	| HBE006_FAILED_TO_UPDATE
	| HBE007_FAILED_TO_DELETE
	| HBE010_NOT_AUTHENTICATED
	| HBE011_FAILED_TO_LOGIN
	| HBE012_FAILED_TO_REGISTER
	| HBE013_ALREADY_REGISTERED
	| HBE014_FAILED_TO_DELIVER
	| HBE015_FAILED_TO_VERIFY
	| HBE016_USER_SESSION_EXPIRED
	| HBE017_NOT_AUTHORIZED
	| HBE040_NOT_FOUND
	| HBE041_INVITATION_NOT_FOUND