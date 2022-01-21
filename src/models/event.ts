import { Document, Model, model, Schema} from 'mongoose'
import { check } from 'express-validator/check'
import * as shortid from 'shortid'
import { EventRecord } from '../interfaces/event'


/**
 * Validation Keys
 */
export const EventValidationKeys = [
    check('name').not().isEmpty(),
    check('description').not().isEmpty(),
    check('country').not().isEmpty(),
	check('address').exists(),
	check('date').not().isEmpty(),
	check('time').not().isEmpty(),
	check('speakers').not().isEmpty(),
	check('community').not().isEmpty(),
	check('map').not().isEmpty(),
	check('agenda').not().isEmpty(),
	check('schedule').not().isEmpty(),
	check('attending').not().isEmpty()
]

export const EventUpdateFilterKeys = [
	'name', 'slug', 'featuredImageUrl', 'userId', 'description', 'country', 'address', 'date', 'time', 'speakers', 'community', 'map', 'agenda', 'schedule', 'attending']


const EventScheduleSchema: Schema = new Schema({
	time: String,
	description: String
}, { _id: false })

const EventSpeakerSchema: Schema = new Schema({
	name: String,
	thumbnailImageUrl: String,
	position: String,
	bio: String
})

/**
 * Invitation Model for Events
 */
export interface EventModel extends EventRecord, Document {}
export const EventSchema: Schema = new Schema({
	shortId: {
		type: String,
		/* tslint:disable */
		'default': shortid.generate /* tslint:enable */
	},
	name: String,
	slug: {
		type: String,
		/* tslint:disable */'default': '' /* tslint:enable */
	},
	featuredImageUrl: String,
	description: String,
	country: String,
	address: String,
	date: String,
	time: String,
	speakers: [EventSpeakerSchema],
	community: [{
		type: Schema.Types.ObjectId,
		ref: 'Community'
	}],
	map: String,
	agenda: String,
	schedule: [EventScheduleSchema],
	attending: [String] // User ids of the attendees
}, {
	timestamps: true
})

EventSchema.pre('init', (doc: any) => {
	doc.countryImage = doc.featuredImageUrl
})

export const EventSchemaModel: Model<EventModel> =
	model<EventModel>('Event', EventSchema)