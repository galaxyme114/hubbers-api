// Define common error classes

import { HubbersErrorType } from '../constants/errors'

export class HubbersBaseError extends Error {
	private errorType: HubbersErrorType
	private originalError: Error

	constructor(errorType: HubbersErrorType, originalError?: Error) {
		super(errorType.message)

		this.errorType = errorType
		this.name = errorType.name
		this.originalError = originalError
	}

	public getStatusCode(): number {
		return this.errorType.status || 500
	}

	public getCode(): string {
		return this.errorType.code
	}

	public getName(): string {
		return this.errorType.name
	}

	public getMessage(): string {
		return this.originalError ? this.originalError.message : this.errorType.message
	}
	
	public getOriginalError() {
		return this.originalError ? this.originalError : undefined
	}

	public getStackTrace(): string {
		return this.originalError ? this.originalError.stack : ''
	}
}