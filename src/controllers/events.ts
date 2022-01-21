import axios from 'axios'

import {
	HBE003_FAILED_TO_FETCH,
	HBE004_FAILED_TO_CREATE,
	HBE006_FAILED_TO_UPDATE,
	HBE040_NOT_FOUND
} from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { EventModel, EventSchemaModel } from '../models/event'
import { slugify } from '../utils/stringUtils'

/**
 * Admin create events
 */
export const adminCreateEvent = (newEventData) => {
	return new Promise<EventModel>((resolve, reject) => {
		newEventData.slug = newEventData.slug ? slugify(newEventData.slug) : slugify(newEventData.name)
		new EventSchemaModel(newEventData)
			.save().then((events) => resolve(events))
			.catch((error: any) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
	})
}

/**
 * Fetch all events
 */
export const fetchAllEvents = () => {
	return new Promise<ReadonlyArray<EventModel>>((resolve, reject) => {
		EventSchemaModel.find({}).sort({ date: 'descending' }).limit(10)
			.then((events) => resolve(events))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 *  Admin fetch all events
 */
export const adminFetchAllEvents = () => {
	return new Promise<ReadonlyArray<EventModel>>((resolve, reject) => {
		EventSchemaModel.find({}).sort({ date: 'descending' }).limit(10)
			.then((events) => resolve(events))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Fetch single event
 */
export const fetchEvent = (eventId: string) => {
	return new Promise<EventModel>((resolve, reject) => {
		EventSchemaModel.findOne({ _id: eventId })
			.then((event) => event ? resolve(event) : reject(new HubbersBaseError(HBE040_NOT_FOUND)))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Fetch single event with shortId
 */
export const fetchEventById = (_id: string) => {
	return new Promise<EventModel>((resolve, reject) => {
		EventSchemaModel.findById({ _id })
			.then((event) => event ? resolve(event) : reject(new HubbersBaseError(HBE040_NOT_FOUND)))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Admin fetch single event with shortId
 */
export const adminFetchEventById = (_id: string) => {
	return new Promise<EventModel>((resolve, reject) => {
		EventSchemaModel.findById({ _id })
			.then((event) => event ? resolve(event) : reject(new HubbersBaseError(HBE040_NOT_FOUND)))
			.catch((error: any) => reject(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)))
	})
}

/**
 * Update event attendance
 */
export const updateEventAttendance = (userId: string, eventId: string, attending: boolean) => {
	return new Promise<EventModel>((resolve, reject) => {
		const action = attending ? { $addToSet: { attending: userId } } : { $pullAll: { attending: [userId] } }

		EventSchemaModel.findOneAndUpdate({ _id: eventId }, action,
			/* tslint:disable */ { 'new': true }) /* tslint:enable */
			.then((event) => resolve(event))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Admin update event attendance
 */
export const adminUpdateEventAttendance = (eventId: string, updateEventData: any) => {
	return new Promise<EventModel>((resolve, reject) => {
		updateEventData.slug = updateEventData.slug ? slugify(updateEventData.slug) : slugify(updateEventData.name)

		EventSchemaModel.findOneAndUpdate({ _id: eventId }, updateEventData,
			/* tslint:disable */ { 'new': true }) /* tslint:enable */
			.then((event) => resolve(event))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Admin delete event with shortId
 */
export const adminRemoveEvent = (shortId: string) => {
	return new Promise<EventModel>((resolve, reject) => {
		EventSchemaModel.findOneAndRemove({ shortId })
			.then((event) => resolve(event))
			.catch((error: any) => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}

/**
 * Sync Events
 */
export const syncEvents = () => {
	return new Promise((resolve, reject) => {
		axios.get(process.env.EVENTS_API)
			.then(response => {
				if (!response.data.events) { reject() } else {
					response.data.events.map((e: any) => {
						return EventSchemaModel.findOneAndUpdate({ name: e.name }, {
							$set: {
								name: e.name,
								slug: slugify(e.name),
								featuredImageUrl: e.countryImage,
								description: e.description,
								country: e.country,
								address: e.address,
								date: e.date,
								time: e.time,
								map: e.map,
								speakers: e.speakers,
								agenda: e.agendaDescription,
								schedule: e.agenda
							}
						},
							/* tslint:disable */
							{ upsert: true, 'new': true, setDefaultsOnInsert: true }) /* tslint:enable */
							.then((event: EventModel) => { console.log('updated event', event) })
					})
					resolve()
				}
			})
	})
}