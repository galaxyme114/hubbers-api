export interface EventSpeakerRecord {
	name: string
	thumbnailImageUrl: string
	position: string
	bio: string
}

export interface EventScheduleRecord {
	time: string
	description: string
}

export interface EventRecord {
	name: string
	description: string
	country: string
	address: string
	date: string
	time: string
	speakers: EventSpeakerRecord[]
	map: string
	agenda: string
	schedule: EventScheduleRecord[]
}