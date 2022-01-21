// Declare redis promise types
declare module 'twilio'
declare module 'redis' {
	export interface RedisClient extends NodeJS.EventEmitter {
		getAsync(...args: any[]): Promise<any>
		setAsync(...args: any[]): Promise<any>
	}
}