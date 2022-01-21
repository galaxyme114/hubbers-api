import * as crypto from 'crypto'
import * as jToken from 'jsonwebtoken'
import { JWTToken } from '../interfaces/user'
import { UserModel } from '../models/user'

export const signJWTToken = (user: UserModel): JWTToken => {
	const signedJWTToken = jToken.sign({ user }, process.env.JWT_SECRET, {
		expiresIn: '1y'
	})
	
	return { token: signedJWTToken }
}

export const generateToken = () => {
	return new Promise<string>((resolve, reject) => {
		crypto.randomBytes(20, (err, buf) => {
			if (err) { reject(err) } else {
				resolve(buf.toString('hex'))
			}
		})
	})
}