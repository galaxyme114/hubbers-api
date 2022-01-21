import { middleware as cache } from 'apicache'
import * as express from 'express'

import { check } from 'express-validator/check'
import {
	adminAuthenticator,
	contestantParticipantAuthenticator,
	entryCreatedByLoggedUserAuthenticator,
	judgeParticipantAuthenticator,
	userAuthenticator,
	isUserLoginAuthenticator,
	webCommandAuthenticator
} from '../middlewares/authenticator'
import { requestValidator } from '../middlewares/errorHandler'

import * as apn from './apn'
import * as appUpdateCheckAPI from './appUpdateCheckAPI'
import * as assetsAPI from './assets'
import * as authAPI from './auth'
import * as businessNeedsAPI from './businessNeeds'
import * as categoriesAPI from './categories'
import * as contestAPI from './contest'
import * as communityAPI from './community'
import * as conversationsAPI from './conversations'
import * as emailSettingsAPI from './emailSettings'
import * as entriesAPI from './entry'
import * as eventsAPI from './events'
import * as expertiseAPI from './expertise'
import * as expertiseCategoryAPI from './expertiseCategory'
import * as expertiseOrderAPI from './expertiseOrder'
import * as feedAPI from './feed'
import * as investorsDataAPI from './investorsData'
import * as inviteAPI from './invite'
import * as kpiAPI from './kpi'
import * as notificationsAPI from './notifications'
import * as onboardingAPI from './onboarding'
import * as postsAPI from './posts'
import * as profileAPI from './profile'
import * as projectsAPI from './projects'
import * as proxyAPI from './proxy'
import * as requestAccessAPI from './requestAccess'
import * as smsAPI from './sms'
import * as smsVerificationAPI from './smsVerification'
import * as testimonialsAPI from './testimonials'
import * as transactionsAPI from './transactions'
import * as userDataAPI from './userData'
import * as userFeedbackAPI from './userFeedback'
import * as usersAPI from './users'
import * as userSessionAPI from './userSession'
import * as webCommandsAPI from './webCommands'

// Setup middleware
const router = express.Router()

/**
 * User Session
 * return the user data and validate if a correct session
 *
 * 1. Fetch user data - GET
 * 2. Store user data - POST
 * 3. Create a user session - POST
 */
router.get('/userData', [
	check('sessionKey').not().isEmpty(),
	requestValidator
], userDataAPI.getUserData)

router.post('/userData', [
	check('sessionKey').not().isEmpty(),
	check('data').not().isEmpty(),
	requestValidator
], userDataAPI.setUserData)

router.post('/userSession', userSessionAPI.store)

// /**
//  * Registration & Authentication routes
//  * 1. Authenticate a user with a pre stored token
//  * 2. Login a user to generate a token
//  * 3. Register a new user and generate a token
//  *
//  */
// router.get('/auth', [
// 	check('token').not().isEmpty(),
// 	requestValidator
// ], authAPI.authOld)
//
// router.post('/auth/login', [
// 	check('email').not().isEmpty(),
// 	check('email').isEmail(),
// 	check('password').not().isEmpty(),
// 	requestValidator
// ], authAPI.login)
//
// router.post('/auth/register', [
// 	check('email').not().isEmpty(),
// 	check('email').isEmail(),
// 	check('password').not().isEmpty(),
// 	requestValidator
// ], authAPI.register)

/**
 * Primary Routes
 *
 * 1. Authentication
 * 2. Login
 * 3. Register
 */
router.get('/auth', userAuthenticator, authAPI.authenticate)
router.post('/auth/login', authAPI.loginMiddleware, authAPI.login)
router.post('/auth/login-phone', authAPI.loginPhoneMiddleware, authAPI.loginPhone)
router.post('/auth/register', authAPI.registerMiddleware, authAPI.register)
router.post('/auth/register-phone', authAPI.registerPhoneMiddleware, authAPI.registerPhone)
router.post('/auth/forgot', authAPI.forgotMiddleware, authAPI.forgot)
router.post('/auth/recover', authAPI.recoverMiddleware, authAPI.recover)
// router.post('/auth/reset-phone', authAPI.resetPhoneMiddleware, authAPI.resetPhone)
router.post('/sms/request', smsAPI.requestMiddleware, smsAPI.request)
router.post('/sms/verify', smsAPI.verifyMiddleware, smsAPI.verify)

router.get('/auth/linkedin', [
	check('code').not().isEmpty(), requestValidator
], authAPI.linkedin)


/**
 * Users Management
 */
router.get('/admin/users', userAuthenticator, adminAuthenticator, usersAPI.adminIndex)
router.post('/admin/users', userAuthenticator, adminAuthenticator, usersAPI.createMiddleware, usersAPI.adminCreate)
router.get('/admin/users/:userId', userAuthenticator, adminAuthenticator, usersAPI.adminFetch)
router.patch('/admin/users/:userId', userAuthenticator, adminAuthenticator,
	usersAPI.updateMiddleware, usersAPI.adminUpdate)
router.delete('/admin/users/:userId', userAuthenticator, adminAuthenticator, usersAPI.adminRemove)

/**
 * Project controller routes
 * 1. Get a list of user's ongoing projects
 * 2. Create a new project - POST
 */
router.get('/projects', userAuthenticator, projectsAPI.index)
router.post('/projects', userAuthenticator, projectsAPI.createMiddleware, projectsAPI.create)
router.get('/projects/:projectId', userAuthenticator, projectsAPI.fetch)
router.patch('/projects/:projectId', userAuthenticator, projectsAPI.update)
router.get('/projects/:projectId/ongoing-tasks', userAuthenticator, projectsAPI.fetchOngoingTasks)
router.get('/projects/:projectId/ongoing-business-needs', userAuthenticator, projectsAPI.fetchBusinessNeeds)

/*
*
* Admin Project API Routes as well as Bisiness
*
*/
router.get('/admin/projects/:projectId', userAuthenticator, adminAuthenticator, projectsAPI.adminIndex)
router.get('/admin/projects', userAuthenticator, adminAuthenticator, projectsAPI.fetchAllProjects)
router.post('/admin/projects', userAuthenticator, ...projectsAPI.adminCreateMiddleware, adminAuthenticator,
	projectsAPI.adminCreate)
router.patch('/admin/projects/:projectId', userAuthenticator, adminAuthenticator, projectsAPI.adminUpdate)
router.delete('/admin/projects/:projectId', userAuthenticator, adminAuthenticator,
	projectsAPI.adminRemoveProject)
router.get('/admin/projects/:projectId/ongoing-business-needs/:id', userAuthenticator, adminAuthenticator,
	projectsAPI.adminFetchSingleBusinessNeeds)
router.get('/admin/projects/:projectId/ongoing-business-needs', userAuthenticator, adminAuthenticator,
	projectsAPI.adminFetchBusinessNeeds)
router.patch('/admin/projects/:projectId/ongoing-business-needs/:id', userAuthenticator, adminAuthenticator,
	projectsAPI.adminUpdateBusinessNeeds)
router.delete('/admin/projects/:projectId/ongoing-business-needs/:id', userAuthenticator, adminAuthenticator,
	projectsAPI.adminRemoveBusinessNeeds)


/**
 * Product Launcher routes
 * 1. Categories - GET
 */
router.get('/categories', cache('1 hour'), categoriesAPI.index)
router.get('/kpi', kpiAPI.index)
router.get('/testimonials', cache('1 hour'), testimonialsAPI.index)

/**
 *	User event routes
 */
router.get('/events', eventsAPI.index)
router.get('/events/:eventId', eventsAPI.fetch)
router.put('/events/:eventId/attend', userAuthenticator,
	eventsAPI.updateAttendanceMiddleware, eventsAPI.updateAttendance)

/**
 * Admin event routes
 *  
 */
router.post('/admin/events', userAuthenticator, adminAuthenticator, eventsAPI.createMiddleware, eventsAPI.adminCreate)
router.get('/admin/events', userAuthenticator, adminAuthenticator, eventsAPI.adminIndex)
router.get('/admin/events/:eventId', userAuthenticator, adminAuthenticator, eventsAPI.adminFetch)
router.put('/admin/events/:eventId/attend', userAuthenticator, adminAuthenticator, eventsAPI.adminUpdateAttendanceMiddleware, eventsAPI.adminUpdateAttendance)
router.delete('/admin/events/:eventId', userAuthenticator, adminAuthenticator, eventsAPI.adminRemove)

/**
 * Expertise order routes
 * 1. Create a new Expertise Order - POST
 * 2. Fetch Single Expertise Order - GET
 * 3. Modify details of an existing Expertise Order - PATCH
 * 4. Make payment for an existing Expertise Order - POST
 */
router.post('/expertise', [userAuthenticator], expertiseAPI.create)
router.get('/expertise', expertiseAPI.index)
router.get('/expertise/ids', [check('ids').exists(), requestValidator], expertiseAPI.indexIds)
router.get('/expertise/category/:categoryId', expertiseAPI.index)
router.get('/expertise/:expertiseId', expertiseAPI.fetch)
router.patch('/expertise/:expertiseId', [userAuthenticator], expertiseAPI.update)
router.get('/expertise/:expertiseId/order', [userAuthenticator], expertiseAPI.fetchOrder)
router.post('/expertise/:expertiseId/order', [userAuthenticator], expertiseAPI.createOrder)
router.patch('/expertise-order/:expertiseOrderId',
	[userAuthenticator, ...expertiseOrderAPI.updateMiddleware], expertiseOrderAPI.update)
// router.post('/expertise-order/:expertiseOrderId/payment', expertiseOrderAPI.payment)

/*
*   Route User Expertise-Order Attachments API
* */
router.put('/expertise-order/:expertiseOrderId/attachments', userAuthenticator,
	expertiseOrderAPI.expertiseOrderAttachments)
router.get('/expertise-order/:expertiseOrderId/attachments', userAuthenticator,
	expertiseOrderAPI.fetchExpertiseOrderAttachments)
router.get('/expertise-order/:expertiseOrderId/attachments/:attachmentId', userAuthenticator,
	expertiseOrderAPI.fetchSingleExpertiseOrderAttachments)
router.patch('/expertise-order/:expertiseOrderId/attachments/:attachmentId', userAuthenticator,
	expertiseOrderAPI.updateExpertiseOrderAttachments)

/*
*   Route Admin Expertise-Order Attachments API  // change the expertiseId to expertiseOrderId
* */
router.put('/admin/expertise-order/:expertiseOrderId/attachments', userAuthenticator, adminAuthenticator,
	expertiseOrderAPI.adminExpertiseOrderAttachments)
router.get('/admin/expertise-order/:expertiseOrderId/attachments', userAuthenticator, adminAuthenticator,
	expertiseOrderAPI.adminFetchExpertiseOrderAttachments)
router.get('/admin/expertise-order/:expertiseOrderId/attachments/:attachmentId',
	userAuthenticator, adminAuthenticator, expertiseOrderAPI.adminFetchSingleExpertiseOrderAttachments)
router.patch('/admin/expertise-order/:expertiseOrderId/attachments/:attachmentId',
	userAuthenticator, adminAuthenticator, expertiseOrderAPI.adminUpdateExpertiseOrderAttachments)

// Expertise Reviews API
router.get('/expertise/:expertiseId/reviews', userAuthenticator, expertiseAPI.fetchReviews)
router.get('/expertise/:expertiseId/reviews/:reviewId', userAuthenticator,
	expertiseAPI.fetchSingleReviews)
router.put('/expertise/:expertiseId/reviews', userAuthenticator, expertiseAPI.reviewCreate)
router.patch('/expertise/:expertiseId/reviews/:reviewId', userAuthenticator,
	expertiseAPI.reviewUpdate)
router.delete('/expertise/:expertiseId/reviews/:reviewId', userAuthenticator,
	expertiseAPI.removeReview)

// Admin Expertise Reviews API
router.get('/admin/expertise/:expertiseId/reviews', userAuthenticator, adminAuthenticator,
	expertiseAPI.adminFetchReviews)
router.get('/admin/expertise/:expertiseId/reviews/:reviewId', userAuthenticator, adminAuthenticator,
	expertiseAPI.adminFetchSingleReviews)
router.put('/admin/expertise/:expertiseId/reviews', userAuthenticator, adminAuthenticator,
	expertiseAPI.adminReviewCreate)
router.patch('/admin/expertise/:expertiseId/reviews/:reviewId', userAuthenticator, adminAuthenticator,
	expertiseAPI.adminReviewUpdate)
router.delete('/admin/expertise/:expertiseId/reviews/:reviewId', userAuthenticator, adminAuthenticator,
	expertiseAPI.adminRemoveReview)

// Admin Expertise API
router.get('/admin/expertise', userAuthenticator, adminAuthenticator, expertiseAPI.adminIndex)
router.get('/admin/expertise/:expertiseId', userAuthenticator, adminAuthenticator, expertiseAPI.adminFetch)
router.post('/admin/expertise', userAuthenticator, adminAuthenticator, expertiseAPI.adminCreate)

router.patch('/admin/expertise/:expertiseId', userAuthenticator, expertiseAPI.adminUpdateMiddleware,
	adminAuthenticator, expertiseAPI.adminUpdate)
router.delete('/admin/expertise/:expertiseId', userAuthenticator, adminAuthenticator,
	expertiseAPI.adminRemoveExpertise)

// Admin Expertise-Order API
router.get('/admin/expertise/:expertiseId/orders', userAuthenticator, adminAuthenticator,
	expertiseOrderAPI.adminFetchOrder)
router.get('/admin/expertise/:expertiseId/orders/:orderId', userAuthenticator, adminAuthenticator,
	expertiseOrderAPI.adminFetchSingleOrder)
router.patch('/admin/expertise/:expertiseId/orders/:orderId', userAuthenticator, adminAuthenticator,
	expertiseOrderAPI.adminUpdateOrder)
router.delete('/admin/expertise/:expertiseId/orders/:orderId', userAuthenticator, adminAuthenticator,
	expertiseOrderAPI.adminRemoveOrder)

/**
 * Expertise category routes
 */
router.get('/expertise-category', expertiseCategoryAPI.index)

/**
 * Business needs routes
 */
router.get('/business-needs', businessNeedsAPI.index)
router.get('/business-needs/category/:categoryId', businessNeedsAPI.index)
router.post('/business-needs', userAuthenticator, businessNeedsAPI.createMiddleware, businessNeedsAPI.create)
router.get('/business-needs/:id', businessNeedsAPI.fetch)
router.delete('/business-needs/:id', [userAuthenticator], businessNeedsAPI.remove)

/**
 * Transactions routes
 */
router.get('/transactions', userAuthenticator, transactionsAPI.index)
router.get('/transactions/:transactionId', userAuthenticator, transactionsAPI.fetch)
router.get('/admin/transactions/user/:userId', userAuthenticator, adminAuthenticator, transactionsAPI.adminIndex)
router.post('/admin/transactions/user/:userId', userAuthenticator, adminAuthenticator,
	transactionsAPI.createMiddleware, transactionsAPI.adminCreate)
router.get('/admin/transactions/:transactionId', userAuthenticator, adminAuthenticator, transactionsAPI.adminFetch)
router.patch('/admin/transactions/:transactionId', userAuthenticator, adminAuthenticator,
	transactionsAPI.updateMiddleware, transactionsAPI.adminUpdate)
router.delete('/admin/transactions/:transactionId', userAuthenticator, adminAuthenticator, transactionsAPI.adminRemove)

/**
 * Media and Assets
 * 1. Create an assets API to upload images and other media assets - POST
 */
router.post('/assets', assetsAPI.storeMiddleware, assetsAPI.store)

/**
 * Invite users | create a temporary user record and send an email to the user
 * 1. Expert
 * 2. Expertise
 * 3. Observer
 */
router.get('/invite/expert', ...inviteAPI.fetchInviteMiddleware, inviteAPI.fetchExpertInvite)
router.post('/invite/expert', [webCommandAuthenticator, ...inviteAPI.inviteExpertMiddleware],
	inviteAPI.inviteExpert)
router.post('/invite/expertise', [webCommandAuthenticator, ...inviteAPI.inviteExpertiseMiddleware],
	inviteAPI.inviteExpertise)

router.get('/invite/observer', ...inviteAPI.fetchInviteMiddleware, inviteAPI.fetchObserverInvite)
router.post('/invite/observer', [webCommandAuthenticator, ...inviteAPI.inviteObserverMiddleware],
	inviteAPI.inviteObserver)

router.get('/invite/contestant', ...inviteAPI.fetchInviteMiddleware, inviteAPI.fetchContestantInvite)
router.post('/invite/contestant', [webCommandAuthenticator, ...inviteAPI.inviteContestantMiddleware],
	inviteAPI.inviteContestant)

router.get('/invite/judge', ...inviteAPI.fetchInviteMiddleware, inviteAPI.fetchJudgeInvite)
router.post('/invite/judge', [webCommandAuthenticator, ...inviteAPI.inviteJudgeMiddleware],
	inviteAPI.inviteJudge)

/**
 * Request Access
 */
router.post('/request-access/observer', requestAccessAPI.observerMiddleware, requestAccessAPI.observer)

/**
 * User Feedback
 */
router.post('/user-feedback/contest-suggestion',
	userFeedbackAPI.contestSuggestionMiddleware, userFeedbackAPI.contestSuggestion)

/**
 * Web Commands Utility Functions
 */
router.get('/cache-reset', webCommandAuthenticator, webCommandsAPI.cacheReset)
router.get('/sync-expertise', webCommandAuthenticator, webCommandsAPI.syncExpertise)
router.get('/sync-expertise-category', webCommandAuthenticator, webCommandsAPI.syncExpertiseCategory)
router.get('/sync-events', webCommandAuthenticator, webCommandsAPI.syncEvents)
router.get('/import-users', webCommandsAPI.importUsers)

/**
 * SMS Verification route
 * 1. Request an SMS confirmation code
 * 2. Verify an SMS confirmation code
 */
router.post('/sms-confirmation/request', smsVerificationAPI.requestMiddleware, smsVerificationAPI.request)
router.post('/sms-confirmation/verify', smsVerificationAPI.verifyMiddleware, smsVerificationAPI.verify)

/**
 * Onboarding Users
 * 1. Observers
 * 2. Expert
 */
router.post('/onboarding/observer', onboardingAPI.observerMiddleware, onboardingAPI.observer)
// router.post('/onboarding/expert', onboardingAPI.expertMiddleware, onboardingAPI.expert)
router.post('/onboarding/contestant', onboardingAPI.contestantMiddleware, onboardingAPI.contestant)
router.post('/onboarding/judge', onboardingAPI.judgeMiddleware, onboardingAPI.judge)

/**
 * Create a proxy to prevent CORS
 * 1. A multi purpose proxy for parsing non local content
 *
 */
router.get('/proxy', proxyAPI.proxy)

/**
 * Conversations
 * 1. Fetch all conversations
 * 2. Create a new conversation
 * 3. Get all messages under a conversation
 * 4. Create a new conversation reply
 */
router.get('/conversations', conversationsAPI.fetchMiddleware, conversationsAPI.fetch)
router.post('/conversations', conversationsAPI.createMiddleware, conversationsAPI.create)
router.get('/conversations/:conversationId', conversationsAPI.fetchConversationMiddleware,
	conversationsAPI.fetchConversation)
router.post('/conversations/:conversationId', conversationsAPI.createMessageMiddleware, conversationsAPI.createMessage)
router.delete('/conversations/:conversationId', conversationsAPI.deleteConversationMiddleware,
	conversationsAPI.deleteConversation)

/*
*  Conversation API Routes
*
* */
router.put('/conversations/:conversationId/participate', userAuthenticator, conversationsAPI.participateToConversation)
router.put('/conversations/:conversationId/leave', userAuthenticator, conversationsAPI.participateLeaveConversation)

/**
 * Investors Data
 */
router.post('/investors/shares', webCommandAuthenticator, userAuthenticator, investorsDataAPI.addShares)
router.get('/investors-data', investorsDataAPI.fetch)

/**
 * User and Profile
 */
router.get('/profile/self', userAuthenticator, profileAPI.fetchSelf)
router.put('/profile/self', userAuthenticator, profileAPI.updateSelf)
router.get('/profile/known-associates', userAuthenticator, profileAPI.fetchKnownAssociates)
router.get('/profile/:id', profileAPI.fetch)

/**
 * Public routes to basic info of users  
 */
router.get('/public-profile/:id', profileAPI.fetchByPublic)
router.get('/profile/:id/:fullName', profileAPI.fetchFullByPublic)


/**
 * User Feed & Posts
 */
router.get('/feed', userAuthenticator, feedAPI.fetch)
router.get('/posts/:tags', userAuthenticator, postsAPI.fetchByTags)
router.get('/posts', userAuthenticator, postsAPI.index)
router.post('/posts', userAuthenticator, postsAPI.createMiddleware, postsAPI.create)
router.get('/posts/:postId', userAuthenticator, postsAPI.fetch)



// router.patch('/posts',  userAuthenticator , postsAPI.update)
// router.delete('/posts/:postId',  userAuthenticator , postsAPI.remove)

router.put('/posts/:postId/like', userAuthenticator, postsAPI.updatePostLikeMiddleware, postsAPI.like)

// router.get('/posts/:postId/comments', [ userAuthenticator ], postsAPI.indexComment)
// router.get('/posts/:postId/comments/:commentId', [ userAuthenticator ], postsAPI.fetchComment)
router.post('/posts/:postId/comments', userAuthenticator, postsAPI.createComment)
// router.patch('/posts/:postId/comments/:commentId', [ userAuthenticator ], postsAPI.updateComment)
router.delete('/posts/:postId/comments/:commentId', userAuthenticator, postsAPI.deleteComment)

/*
*  Admin Feed & Post API Route
* */
router.get('/admin/posts', userAuthenticator, adminAuthenticator, postsAPI.adminIndex)
router.get('/admin/posts/:postId', userAuthenticator, adminAuthenticator, postsAPI.adminFetch)
router.post('/admin/posts', userAuthenticator, postsAPI.adminCreateMiddleware, adminAuthenticator,
	postsAPI.adminCreate)
router.patch('/admin/posts/:postId', userAuthenticator, adminAuthenticator, postsAPI.adminUpdate)
router.post('/admin/posts/:postId/comments', userAuthenticator, adminAuthenticator, postsAPI.adminCreateComment)
router.delete('/admin/posts/:postId/comments/:commentId', userAuthenticator, adminAuthenticator,
	postsAPI.adminDeleteComment)
router.delete('/admin/posts/:postId', userAuthenticator, adminAuthenticator, postsAPI.adminDeletePost)
router.get('/admin/feed', userAuthenticator, adminAuthenticator, feedAPI.adminFetch)

/**
 * Notifications
 */
router.get('/notifications', userAuthenticator, notificationsAPI.index)
router.put('/notifications/seen', userAuthenticator, notificationsAPI.seenMiddleware, notificationsAPI.seen)

/**
 * Email Settings
 */
router.get('/email-settings/:shortId/:accessCode', emailSettingsAPI.fetch)
router.patch('/email-settings/:shortId/:accessCode',
	emailSettingsAPI.updateEmailSettingsMiddleware, emailSettingsAPI.update)

/**
 * Store User APN token
 */
router.post('/users/store-device-token', userAuthenticator, apn.storeApn)
router.get('/users/send-apn-notification', userAuthenticator, apn.sendApn)

/**
 * Contest public routes
 */
// Contest fetch APIs for Users
router.get('/contests', contestAPI.fetchAll)
router.get('/contests/:shortId/leaderboard', contestAPI.leaderboard)
router.get('/contests/:shortId', contestAPI.fetchByShortId)

// Contest participate APIs
router.post('/contests/:contestId/participate/judge', userAuthenticator, contestAPI.contestParticipateJudge)
router.post('/contests/:contestId/participate/contestant', userAuthenticator, contestAPI.contestParticipateContestant)

// Contest meta action APIs
router.post('/contests/:contestId/like', contestAPI.updateContestLikeMiddleware, contestAPI.like)
router.post('/contests/:contestId/view', contestAPI.updateContestViewMiddleware, contestAPI.view)

/**
 * Contest admin routes
 */
// Contest fetch APIs for Admins
router.get('/admin/contests', userAuthenticator, adminAuthenticator, contestAPI.adminFetchAll)
router.get('/admin/contests/:contestId', userAuthenticator, adminAuthenticator, contestAPI.adminFetch)
router.post('/admin/contests/', userAuthenticator, adminAuthenticator,
	contestAPI.adminCreateContestMiddleware, contestAPI.adminCreate)

// Contest approvals and rejection APIs for Admins
router.post('/admin/contests/:contestId/approve/judge/:judgeId', userAuthenticator, adminAuthenticator,
	contestAPI.adminApproveJudgeMiddleware, contestAPI.adminApproveJudge)
router.post('/admin/contests/:contestId/approve/contestant/:contestantId', userAuthenticator, adminAuthenticator,
	contestAPI.adminApproveContestantMiddleware, contestAPI.adminApproveContestant)
router.post('/admin/contests/:contestId/reject/judge/:judgeId', userAuthenticator, adminAuthenticator,
	contestAPI.adminRejectJudgeMiddleware, contestAPI.adminRejectJudge)
router.post('/admin/contests/:contestId/reject/contestant/:contestantId', userAuthenticator, adminAuthenticator,
	contestAPI.adminRejectContestantMiddleware, contestAPI.adminRejectContestant)
router.delete('/admin/contests/:contestId/contestant-application/:contestantId',
	userAuthenticator, adminAuthenticator, contestAPI.deleteContestantApplication)
router.delete('/admin/contests/:contestId/judge-application/:judgeId',
	userAuthenticator, adminAuthenticator, contestAPI.deleteJudgeApplication)

// Contest update APIs for Admins
router.patch('/admin/contests/:contestId', userAuthenticator, adminAuthenticator,
	contestAPI.adminUpdateContestMiddleware, contestAPI.updateContest)
router.delete('/admin/contests/:contestId', userAuthenticator, adminAuthenticator, contestAPI.deleteContest)

/**
 * Entries API Routes
 */
router.post('/entries/contest/:contestId', userAuthenticator, entriesAPI.create)
router.get('/entries/contest/:contestId/contestant', userAuthenticator, contestantParticipantAuthenticator,
	entriesAPI.contestContestantEntry)
router.get('/entries/contest/:contestId/judge', userAuthenticator, judgeParticipantAuthenticator,
	entriesAPI.contestEntryJudge)
router.get('/entries/:entryId', userAuthenticator, entryCreatedByLoggedUserAuthenticator,
	entriesAPI.fetchContestEntry)
router.patch('/entries/:entryId', userAuthenticator, entryCreatedByLoggedUserAuthenticator, entriesAPI.updateEntry)
router.put('/entries/:entryId/attachments', requestValidator, userAuthenticator, entriesAPI.entryAttachments)
router.patch('/entries/:entryId/attachments/:attachmentId', userAuthenticator,
	entryCreatedByLoggedUserAuthenticator, entriesAPI.updateEntryAttachments)

router.put('/entries/:entryId/ratings', userAuthenticator, entriesAPI.entryRatingMiddleware, entriesAPI.entryRating)
router.get('/entries/:entryId/ratings', userAuthenticator, entriesAPI.fetchRatings)

router.patch('/entries/:entryId/ratings/:ratingId', userAuthenticator, entriesAPI.updateEntryRating)

/**
 * Admin Entries API Routes
 */
router.get('/admin/entries/contest/:contestId', [userAuthenticator, adminAuthenticator], entriesAPI.adminIndex)
router.get('/admin/entries/contest/:contestId/contestant/:contestantId', [
	requestValidator, userAuthenticator, adminAuthenticator], entriesAPI.adminFetch)

router.get('/admin/entries/contest/:contestId/judge/:judgeId',
	requestValidator, userAuthenticator, adminAuthenticator, entriesAPI.adminFetchJudge)

router.get('/admin/entries/:entryId', requestValidator, userAuthenticator, adminAuthenticator,
	entriesAPI.adminFetchEntry)
router.post('/admin/entries/contest/:contestId', userAuthenticator, adminAuthenticator,
	entriesAPI.adminCreateMiddleware, entriesAPI.adminCreate)

router.patch('/admin/entries/:entryId', userAuthenticator, adminAuthenticator,
	entriesAPI.adminUpdateEntryMiddleware, entriesAPI.adminUpdateEntry)

router.delete('/admin/entries/:entryId', userAuthenticator, adminAuthenticator,
	entriesAPI.adminRemoveContestEntry)

router.put('/admin/entries/:entryId/attachments', userAuthenticator, adminAuthenticator,
	entriesAPI.adminEntryAttachmentsMiddleware, entriesAPI.adminEntryAttachments)

router.patch('/admin/entries/:entryId/attachments/:attachmentId', userAuthenticator, adminAuthenticator,
	entriesAPI.adminUpdateEntryAttachmentsMiddleware, entriesAPI.adminUpdateEntryAttachments)

router.put('/admin/entries/:entryId/ratings', userAuthenticator, adminAuthenticator,
	entriesAPI.adminEntryRatingMiddleware, entriesAPI.adminEntryRating)

router.get('/admin/entries/:entryId/ratings/:ratingId', userAuthenticator, adminAuthenticator,
	entriesAPI.adminFetchRating)

router.delete('/admin/entries/:entryId/ratings/:ratingId', userAuthenticator, adminAuthenticator,
	entriesAPI.adminRemoveEntryRating)

router.get('/admin/entries/:entryId/ratings', userAuthenticator, adminAuthenticator, entriesAPI.adminfetchAllRating)

router.patch('/admin/entries/:entryId/ratings/:ratingId', userAuthenticator, adminAuthenticator,
	entriesAPI.adminUpdateEntryRatingMiddleware, entriesAPI.adminUpdateEntryRating)

/**
 * Admin Community API Routes
 */
router.post('/admin/communities', userAuthenticator, communityAPI.createMiddleware, adminAuthenticator, communityAPI.adminCreate)
router.patch('/admin/communities/:communityId', userAuthenticator, communityAPI.updateMiddleware, adminAuthenticator, communityAPI.adminUpdate)
router.get('/admin/communities', userAuthenticator, adminAuthenticator, communityAPI.adminFetch)
router.get('/admin/communities/:communityId', userAuthenticator, adminAuthenticator, communityAPI.adminFetchSingle)
router.delete('/admin/communities/:communityId', userAuthenticator, adminAuthenticator, communityAPI.adminRemove)


/**
 * Community data for not login User
 */
router.get('/blog', communityAPI.blogs)
router.get('/communities', isUserLoginAuthenticator, communityAPI.fetchForPublic)
router.get('/communities/public/:communityId', communityAPI.fetchSingleForPublic)

/**
 * User Community API Routes
 */
// router.get('/communities', userAuthenticator, communityAPI.fetch)
router.get('/communities/:communityId', userAuthenticator, communityAPI.fetchSingle)

/**
 * Misc Routes
 *
 * 1. APP Update Check
 *
 */
router.get('/app-update-check', appUpdateCheckAPI.fetch)

export default router