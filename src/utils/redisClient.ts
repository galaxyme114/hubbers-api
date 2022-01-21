import * as Promise from 'bluebird'
import * as redis from 'redis'

declare module 'redis' {
	export interface RedisClient extends NodeJS.EventEmitter {
		getAsync(...args: any[]): Promise<any>
		setAsync(...args: any[]): Promise<any>
		existsAsync(...args: any[]): Promise<any>
	}
}

const redisClient =  Promise.promisifyAll(
	redis.createClient(6379, 'hubbers-api-redis', null)) as redis.RedisClient

export default redisClient