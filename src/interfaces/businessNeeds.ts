import { ExpertiseOrderRecord, ExpertiseRecord } from './expertise'
import { ProjectRecord } from './project'

export interface BusinessNeedsBidsRecord {
	proposal: string,
	expertise: ExpertiseRecord,
	selectedPackage: string
}

export interface BusinessNeedsRecord {
	shortId: string
	description: string
	tags: string[]
	project: ProjectRecord
	bids: BusinessNeedsBidsRecord[]
	expertiseOrder: ExpertiseOrderRecord
}