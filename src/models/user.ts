import * as bcrypt from 'bcrypt-nodejs'
import { check } from 'express-validator/check'
import { Document, Model, model, Schema } from 'mongoose'
import { UserRecord } from '../interfaces/user'

/**
 * Validation Keys
 */
export const UserValidationKeys = [
	check('name').not().isEmpty(),
	check('lastName').exists(),
	check('email').not().isEmpty(),
	check('email').isEmail(),
	check('preferredRole').not().isEmpty()
]
export const UserUpdateFilterKeys = [
	'name', 'lastName', 'email', 'preferredRole', 'thumbnailImageUrl', 'phoneNumber', 'phoneNumberCountryCode', 'associatedCommunity',
	'preferredRole', 'capabilities', 'gender', 'dob', 'bio', 'headline', 'industry', 'locations', 'languages', 'positions',
	'education'
]

/**
 * User Helper Functions
 */
export const fillRawUserModel = (rawUserModel: any) => {
	if (!rawUserModel.thumbnailImageUrl) {
		const fullName = rawUserModel.lastName ? rawUserModel.name + '+' + rawUserModel.lastName : rawUserModel.name
		rawUserModel.thumbnailImageUrl =
			'https://ui-avatars.com/api/?background=444444&size=200&font-size=0.4&color=fff&name=' +
			fullName.replace(/ /g, '+')
	}

	rawUserModel.fullName = rawUserModel.lastName ? rawUserModel.name + ' ' + rawUserModel.lastName : rawUserModel.name
	
	const userShares = 0
	// rawUserModel.shares.map(share => userShares += share.numShares)
	rawUserModel.shares = userShares
	
	rawUserModel.nationality = ''
	if (rawUserModel.locations && rawUserModel.locations.length > 0) {
		rawUserModel.nationality = rawUserModel.locations[0].country
	}

	return rawUserModel
}

/**
 * User Model
 */
const UserShareSchema: Schema = new Schema({
	numShares: Number,
	bidAmount: String,
	createdAt: {
		type: Date,
		/* tslint:disable */
		'default': Date.now() /* tslint:enable */
	},
	updatedAt: {
		type: Date,
		/* tslint:disable */
		'default': Date.now() /* tslint:enable */
	}

})

const UserActivitySchema: Schema = new Schema({
	entityType: String,
	entityId: String,
	message: String
}, { timestamps: true })

const PushAssociationSchema: Schema = new Schema({
	type: String,
	token: String,
	createdAt: {
		type: Date,
		/* tslint:disable */
		'default': Date.now() /* tslint:enable */
	},
	updatedAt: {
		type: Date,
		/* tslint:disable */
		'default': Date.now() /* tslint:enable */
	}
})

const UserPositionSchema: Schema = new Schema({
	title: String,
	isCurrent: Boolean,
	locationCountry: String,
	locationState: String,
	locationCity: String,
	companyName: String,
	companyType: String,
	companyIndustry: String,
	companySize: String,
	startDate: String,
	endDate: String
})

const UserLocationSchema: Schema = new Schema({
	country: String,
	state: String,
	city: String,
	pin: String,
	name: String,
	isPrimary: Boolean
})

const UserLanguageSchema: Schema = new Schema({
	language: String,
	level: String
}, { _id: false })

const UserEducationSchema: Schema = new Schema({
	country: String,
	name: String,
	title: String,
	degree: String,
	year: Number
}, { _id: false })

export interface UserModel extends UserRecord, Document { }
export const UserSchema: Schema = new Schema({
	thumbnailImageUrl: String,
	thumbnailId: Number,
	name: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	email: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	phoneNumber: {
		type: String
	},
	phoneNumberCountryCode: {
		type: String
	},
	phoneVerified: {
		type: Boolean,
		/* tslint:disable */
		'default': false /* tslint:enable */

	},
	password: {
		type: String,
		required: true
	},
	resetPasswordToken: {
		type: String,
		/* tslint:disable */'default': null /* tslint:enable */
	},
	preferredRole: {
		type: String,
		/* tslint:disable */'default': 'creator' /* tslint:enable */
	},
	needsReset: Number,
	registered: {
		type: Boolean,
		/* tslint:disable */
		'default': false /* tslint:enable */
	},
	capabilities: [String],
	gender: {
		type: String,
		/* tslint:disable */
		'default': '-' /* tslint:enable */
	},
	facebook: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	google: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	twitter: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	wechat: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	ageGate: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	instagram: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	skypeId: {
		type: String,
		/* tslint:disable */
		'default': '' /* tslint:enable */
	},
	confirmed: {
		type: Boolean,
		/* tslint:disable */
		'default': false /* tslint:enable */
	},
	userActivity: [UserActivitySchema],
	confirmationCode: String,
	rememberToken: String,
	isTeamMember: String,
	workingContactTime: String,
	contactTime: String,
	address: String,
	dob: String,
	bio: String,
	headline: String,
	industry: String,
	legacyId: String,
	// shares: [UserShareSchema],
	linkedinToken: String,
	specialties: [String],
	summary: String,
	locations: [UserLocationSchema],
	languages: [UserLanguageSchema],
	positions: [UserPositionSchema],
	education: [UserEducationSchema],
	pushAssociation: [PushAssociationSchema],
	skills: [String],
	productCategories: [String],
	innovationCategories: [String],
	expertiseCategories: [String],
	investorInvestmentBudget: String,
	investorInvestmentGoal: String,
	investorInvestmentReason: String,
	associatedCommunity: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
	isHubbersInvestor: {
		type: Boolean,
		/* tslint:disable */
		'default': false /* tslint:enable */
	},
	isLoginWithLinkedin: {
		type: Boolean,
		/* tslint:disable */
		'default': false /* tslint:enable */
	},
	linkedinId: String,
	roles: [String]
}, {
	timestamps: true
})

UserSchema.pre('init', (doc: any) => {
	doc = fillRawUserModel(doc)
})

// Compare password when user login
UserSchema.methods.comparePassword = (password: string, comparePassword: string, next: any) => {
	bcrypt.compare(password, comparePassword, (err, isMatch) => {
		if (err) { return next(err) }
		next(null, isMatch)
	})
}

UserSchema.methods.toJSON = function() {
	const obj = this.toObject()
	delete obj.password
	delete obj.resetPasswordToken
	delete obj.__v
	return obj
}

export const UserSchemaModel: Model<UserModel> = model<UserModel>('User', UserSchema)