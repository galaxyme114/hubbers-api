import { HBE003_FAILED_TO_FETCH, HBE004_FAILED_TO_CREATE, HBE006_FAILED_TO_UPDATE } from '../constants/errors'
import { adminCreateCommunity, adminFetchAllCommunity, adminUpdateCommunity, adminFetchSingleCommunity, adminRemoveCommunity, fetchAllCommunity, fetchAllCommunityForPublic, fetchSingleCommunityForPublic, fetchSingleCommunity, fetchBlogs } from '../controllers/community'
import { HubbersBaseError } from '../errors'
import { filterObject } from '../utils/stringUtils'
import { requestValidator } from '../middlewares/errorHandler'
import { CommunityUpdateFilterKeys, CommunityValidationKeys } from '../models/community'

/**
 * admin create community
 *
 * @param req
 * @param res
 * @param next
 */
export const createMiddleware = [...CommunityValidationKeys, requestValidator]

export const adminCreate = (req, res, next) => {
    let newCommunityData = filterObject(req.body, CommunityUpdateFilterKeys)
    // let user = req.user._id
    // newCommunityData['user'] = [user]
    adminCreateCommunity(newCommunityData)
        .then(community => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}


/**
 * admin update community
 *
 * @param req
 * @param res
 * @param next
 */
export const updateMiddleware = [...CommunityValidationKeys, requestValidator]

export const adminUpdate = (req, res, next) => {
    let newCommunityData = filterObject(req.body, CommunityUpdateFilterKeys)
    let communityId = req.params.communityId
    console.log('newCommunityData', newCommunityData)
    console.log('communityId', communityId)

    // newCommunityData['user'] = [user]
    adminUpdateCommunity(communityId, newCommunityData)
        .then(community => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * for test Ghost blog xml to json object
 *
 * @param req
 * @param res
 * @param next
 */
export const blogs = (req, res, next) => {
    console.log('blog1')
    fetchBlogs()
        .then(community => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Admin Fetch all community
 *
 * @param req
 * @param res
 * @param next
 */
export const adminFetch = (req, res, next) => {

    adminFetchAllCommunity()
        .then((community) => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}


/**
 * User Fetch all community
 *
 * @param req
 * @param res
 * @param next
 */
export const fetch = (req, res, next) => {

    fetchAllCommunity()
        .then((community) => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Public Fetch all Community
 *
 * @param req
 * @param res
 * @param next
 */
export const fetchForPublic = (req, res, next) => {
    const isLogin = req.user ? req.user.isLogin : false

    let userId = null
    if (isLogin) { userId = req.user.id }

    fetchAllCommunityForPublic(userId)
        .then((community) => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Admin Fetch Single community
 *
 * @param req
 * @param res
 * @param next
 */
export const adminFetchSingle = (req, res, next) => {
    let communityId = req.params.communityId

    adminFetchSingleCommunity(communityId)
        .then((community) => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * User Fetch Single community
 *
 * @param req
 * @param res
 * @param next
 */
export const fetchSingle = (req, res, next) => {
    let communityId = req.params.communityId

    fetchSingleCommunity(communityId)
        .then((community) => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}

/**
 * Public Fetch Single community
 *
 * @param req
 * @param res
 * @param next
 */
export const fetchSingleForPublic = (req, res, next) => {
    let communityId = req.params.communityId

    fetchSingleCommunityForPublic(communityId)
        .then((community) => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}


/**
 * admin remove community
 *
 * @param req
 * @param res
 * @param next
 */
export const adminRemove = (req, res, next) => {

    let communityId = req.params.communityId
    // newCommunityData['user'] = [user]
    adminRemoveCommunity(communityId)
        .then(community => res.json(community))
        .catch(error => next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
}
