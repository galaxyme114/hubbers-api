import * as Knex from 'knex'

const legacyDb = Knex({
	client: process.env.LEGACY_DB_CLIENT,
	connection: {
		host : process.env.LEGACY_DB_HOST,
		database : process.env.LEGACY_DB_DATABASE,
		user : process.env.LEGACY_DB_USER,
		password : process.env.LEGACY_DB_PASSWORD,
		charset: 'utf8'
	}
})

export default legacyDb