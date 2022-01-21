import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt'
import { UserModel, UserSchemaModel } from '../models/user'

export interface PassportJWTAuthenticationResponse {
	type: string
	model: any
}

export const passportJWTAuthentication = (passportJwt: any) => {
	passportJwt.use(new JWTStrategy({
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET
	}, (jwtPayload, done) => {
		UserSchemaModel.findById(jwtPayload.user._id)
			.then((user: UserModel) => done(null, { type: 'user', model: user }))
			.catch((error) => done(error))
	}))
}