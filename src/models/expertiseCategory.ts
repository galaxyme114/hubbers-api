import { Document, Model, model, Schema} from 'mongoose'

import { ExpertiseCategoryRecord } from '../interfaces/expertise'

export interface ExpertiseCategoryModel extends ExpertiseCategoryRecord, Document {}
export const ExpertiseCategorySchema: Schema = new Schema({
	name: String,
	slug: String,
	description: String,
	icon: String
}, {
	timestamps: true
})

export const ExpertiseCategorySchemaModel: Model<ExpertiseCategoryModel> =
	model<ExpertiseCategoryModel>('ExpertiseCategory', ExpertiseCategorySchema)