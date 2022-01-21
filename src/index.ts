import bugsnag from '@bugsnag/js'
import bugsnagExpress from '@bugsnag/plugin-express'
import * as bodyParser from 'body-parser'
import * as viewEngines from 'consolidate'
import * as express from 'express'
import * as mongoose from 'mongoose'
import * as passport from 'passport'

import 'dotenv/config'
import { passportJWTAuthentication, PassportJWTAuthenticationResponse } from './config/passport'

import * as contestEvents from './events/contest'
import * as conversationEvents from './events/conversations'
import * as entryRating from './events/entryRating'
import * as notifyExpertise from './events/expertise'
import * as investorEvents from './events/investors'
import * as inviteEvents from './events/invite'
import * as notifyEvents from './events/notify'
import * as resetPassword from './events/resetPassword'

import apiRoutes from './routes'

import { HubbersBaseError } from './errors'

// Initialize the express APP
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.engine('html', viewEngines.swig)
app.set('views', __dirname + '/views')

// Initialize the passport
app.use(passport.initialize())
passportJWTAuthentication(passport)

// Bugsnag
const bugsnagClient = bugsnag(process.env.BUGSNAG_API_KEY)
bugsnagClient.use(bugsnagExpress)
const bugsnagMiddleware = bugsnagClient.getPlugin('express')
app.use(bugsnagMiddleware.requestHandler)

// Get the Access Token
app.use((req, res, next) => {
	passport.authenticate('jwt', { session: false },
		(err, authenticateResponse: PassportJWTAuthenticationResponse) => {
			if (err) { return next(err) }
			req.user = authenticateResponse.model
			next()
		})(req, res, next)
})

// Enable CORS
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE')
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	res.header('X-Frame-Options', 'ALLOW-FROM https://hubbers.io')

	// intercept OPTIONS method
	if ('OPTIONS' === req.method) {
		res.send(200)
	} else {
		next()
	}
})

// Import routes
app.get('/', (req, res) => { res.send('Hubbers API' )})
app.use('/v2/', apiRoutes)

// Handle errors
app.use((error: HubbersBaseError, req, res, next) => {
	if (error instanceof HubbersBaseError) {
		res.status(error.getStatusCode()).json({
			error: {
				code: error.getCode(),
				name: error.getName(),
				message: error.getMessage(),
				validationErrors: error.getCode() === '002' ? error.getOriginalError() : undefined
			}
		})
	}
})

app.use(bugsnagMiddleware.errorHandler)

// Events - TODO: Find a better place to define these
// Invitation Events
app.on('invite:observer', (data: any) => inviteEvents.inviteObserverEvent(data))
app.on('invite:contestant', (data: any) => inviteEvents.inviteContestantEvent(data))
app.on('invite:judge', (data: any) => inviteEvents.inviteJudgeEvent(data))
app.on('invite:expert', (data: any) => inviteEvents.inviteExpertEvent(data))

// Conversation Messages Events
app.on('conversationMessage:new', (data: any) => conversationEvents.newConversationMessage(data))

// Notification Events
app.on('notify:new-observer', (data: any) => notifyEvents.notifyObserverGroup(data))
app.on('notify:new-investor', (data: any) => notifyEvents.notifyInvestorGroup(data))

app.on('entry:new', (data: any) => contestEvents.notifyJudgeGroup(data))
app.on('rating:new', (data: any) => entryRating.newEntryRating(data))

app.on('contestantApplication:new', (data: any) => contestEvents.notifyAdminsNewContestantApplication(data))
app.on('judgeApplication:new', (data: any) => contestEvents.notifyAdminsNewJudgeApplication(data))

app.on('contestantApplicationApproved:new', (data: any) => contestEvents.notifyContestantApplicationApproved(data))
app.on('judgeApplicationApproved:new', (data: any) => contestEvents.notifyJudgeApplicationApproved(data))

app.on('expertiseApplicationApproved:new', (data: any) => notifyExpertise.notifyExpertise(data))
app.on('expertise:order', (data: any) => notifyExpertise.notifyExpert(data))

// Welcome Events
app.on('welcome:investor', (data: any) => investorEvents.welcome(data))

// User Activity Events
app.on('contestantActivity:new', (data: any) => contestEvents.participateContestantActivity(data))
app.on('judgeActivity:new', (data: any) => contestEvents.participateJudgeActivity(data))
app.on('like:new', (data: any) => contestEvents.contestContestantLikeActivity(data))
app.on('entryActivity:new', (data: any) => contestEvents.contestantSubmitEntry(data))
app.on('notify:reset-password', (data: any) => resetPassword
.notifyResetPassword(data))
// Set up default mongoose connection
const mongoDB = process.env.MONGO_URI
mongoose.connect(mongoDB).then(() => console.log('Mongo Connected!')).catch((error) => console.log('error =' + error))

// Set up legacy mysql connection

// Start the APP
app.listen(process.env.WEB_PORT, () => console.log('Server started on : ' + process.env.PORT))
