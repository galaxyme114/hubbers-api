import {
	HBET001_INVITE_CONTESTANT, HBET001_INVITE_EXPERT, HBET001_INVITE_JUDGE,
	HBET001_INVITE_OBSERVER
} from '../constants/emailTemplate'
import { InviteContestantModel, InviteExpertModel, InviteJudgeModel } from '../models/invite'
import { EmailBuilder } from '../utils/emailClient'

export const inviteObserverEvent = (invite: InviteExpertModel) => {
	const invitationLink = process.env.WEB_URL + '/observer-invitation/' + invite._id

	const to = [ invite.email ]
	const mailData = {
		name: invite.name,
		email: invite.email,
		invitationLink
	}

	const eb = new EmailBuilder(HBET001_INVITE_OBSERVER, to, mailData)
	return eb.send()
}

export const inviteContestantEvent = (invite: InviteContestantModel) => {
	const invitationLink = process.env.WEB_URL + '/contestant-invitation/' + invite._id

	const to = [ invite.email ]
	const mailData = {
		name: invite.name,
		email: invite.email,
		invitationLink
	}

	const eb = new EmailBuilder(HBET001_INVITE_CONTESTANT, to, mailData)
	return eb.send()
}

export const inviteJudgeEvent = (invite: InviteJudgeModel) => {
	const invitationLink = process.env.WEB_URL + '/judge-invitation/' + invite._id

	const to = [ invite.email ]
	const mailData = {
		name: invite.name,
		email: invite.email,
		invitationLink
	}

	const eb = new EmailBuilder(HBET001_INVITE_JUDGE, to, mailData)
	return eb.send()
}

export const inviteExpertEvent = (invite: InviteExpertModel) => {
	const invitationLink = process.env.WEB_URL + '/expert-invitation/' + invite._id

	const to = [ invite.email ]
	const mailData = {
		name: invite.name,
		email: invite.email,
		invitationLink
	}

	const eb = new EmailBuilder(HBET001_INVITE_EXPERT, to, mailData)
	return eb.send()
}