export interface LinkedinResponse {
	id: string
	emailAddress: string
	firstName: string
	formattedName: string
	headline: string
	lastName: string
	industry: string
	location: { country: { code: string }, name: string }
	pictureUrl: string
	pictureUrls: { values: string[] }
	positions: { values: LinkedinPositionResponse[] },
	publicProfileUrl: string
	isLoginWithLinkedin: boolean
}

export interface LinkedinPositionResponse {

}