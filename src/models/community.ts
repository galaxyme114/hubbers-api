import { Document, Model, model, Schema } from 'mongoose'
import { check } from 'express-validator/check'
import * as shortid from 'shortid'
import { CommunityRecord } from '../interfaces/community'


/**
 * Validation Keys
 */
export const CommunityValidationKeys = [
    check('name').not().isEmpty(),
    check('country').not().isEmpty(),
    check('city').not().isEmpty(),
    check('numConsultants').not().isEmpty(),
	check('facilitators').exists(),
	check('socialMediaTags').not().isEmpty(),
	check('partners').not().isEmpty()
]
export const CommunityUpdateFilterKeys = [
	'name', 'country', 'city', 'featuredImageUrl', 'numConsultants', 'facilitators', 'socialMediaTags', 'partners','tags']

/**
 * CommunitySchema Facilitator
 * 
 */
const CommunityFacilitatorSchema: Schema = new Schema({
	availability: String,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })


/** 
*  Community Model
*/
export interface CommunityModel extends CommunityRecord, Document { }

const CommunitySchema: Schema = new Schema({
    shortId: {
        type: String,
        /* tslint:disable */
        'default': shortid.generate /* tslint:enable */
    },
    name: String,
    country: {
        type: String
    },
    city: {
        type: String
    },
    featuredImageUrl: {
        type: String
    },
    numConsultants: {
        type: Number
    },
    facilitators: [CommunityFacilitatorSchema],
    socialMediaTags: [String],
    tags: [String],
    partners: [String]
}, {
        timestamps: true
    })

export const CommunitySchemaModel: Model<CommunityModel> = model<CommunityModel>('Community', CommunitySchema)