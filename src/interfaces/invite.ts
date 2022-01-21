export interface Invite {
	name: string
}

export interface InviteUser extends Invite {
	lastName: string
	email: string
}

export interface InviteExpert extends InviteUser {
	tags: [string]
}

export interface InviteExpertise extends Invite {
	tags: [string]
}

export interface InviteObserver extends InviteUser {}

export interface InviteContestant extends InviteUser {
	contestId: string
}

export interface InviteJudge extends InviteUser {
	contestId: string
}