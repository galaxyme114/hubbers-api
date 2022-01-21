import * as apn from 'apn'

const options = {
	token: {
		key: process.env.APN_KEY,
		keyId: process.env.APN_KEY_ID,
		teamId: process.env.APN_TEAM_ID
	},
	production: process.env.APN_ENV === 'production'
}

const apnProvider = new apn.Provider(options)

export default apnProvider