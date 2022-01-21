// Listing of all commonly used errors

interface HubbersEmailTemplate {
	name: string
	from: string
	subject: string
	view: string
}

// Admin Emails
type HBET001_NEW_USER_ADMIN = HubbersEmailTemplate
type HBET001_OBSERVER_REQUEST_ADMIN = HubbersEmailTemplate

// User Emails
type HBET001_NEW_USER_MESSAGE = HubbersEmailTemplate
type HBET001_INVITE_OBSERVER = HubbersEmailTemplate
type HBET001_INVITE_CONTESTANT = HubbersEmailTemplate
type HBET001_INVITE_JUDGE = HubbersEmailTemplate
type HBET001_INVITE_EXPERT = HubbersEmailTemplate
type HBET001_WELCOME_INVESTOR = HubbersEmailTemplate
type HBET001_NOTIFY_SHAREHOLDER = HubbersEmailTemplate
type HBET001_NOTIFY_PRODUCT = HubbersEmailTemplate

type HBET007_NOTIFY_NEW_OBSERVER = HubbersEmailTemplate
type HBET007_NOTIFY_NEW_INVESTOR = HubbersEmailTemplate
type HBET007_NOTIFY_JUDGE = HubbersEmailTemplate

type HBET007_NOTIFY_CONTESTANT = HubbersEmailTemplate
type HBET007_NOTIFY_ADMINS_FOR_NEW_CONTESTANT = HubbersEmailTemplate
type HBET007_NOTIFY_ADMINS_FOR_NEW_JUDGE = HubbersEmailTemplate
type HBET007_NOTIFY_CONTESTANT_FOR_APPROVED = HubbersEmailTemplate
type HBET007_NOTIFY_JUDGE_FOR_APPROVED = HubbersEmailTemplate
type HBET008_NOTIFY_EXPERT = HubbersEmailTemplate
type HBET001_CONTEST_SUGGESTION_ADMIN = HubbersEmailTemplate
type HBET009_RESET_PASSWORD = HubbersEmailTemplate

export const HBET001_NEW_USER_ADMIN: HBET001_NEW_USER_ADMIN = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'We\'ve got a new user!',
	view: 'views/emails/registration.html'
}

export const HBET001_OBSERVER_REQUEST_ADMIN: HBET001_OBSERVER_REQUEST_ADMIN = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'We\'ve got a new access request for observer',
	view: 'views/emails/request-access-observer.html'
}

export const HBET001_CONTEST_SUGGESTION_ADMIN: HBET001_CONTEST_SUGGESTION_ADMIN = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'We\'ve got a new contest suggestion',
	view: 'views/emails/contest-suggestion.html'
}

export const HBET001_NEW_USER_MESSAGE: HBET001_NEW_USER_MESSAGE = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'New Message',
	view: 'views/emails/new-message.html'
}

export const HBET001_INVITE_OBSERVER: HBET001_INVITE_OBSERVER = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Welcome as a Hubbers Observer',
	view: 'views/emails/invite-observer.html'
}

export const HBET001_INVITE_CONTESTANT: HBET001_INVITE_CONTESTANT = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Welcome as a Hubbers Contestant',
	view: 'views/emails/invite-contestant.html'
}

export const HBET001_INVITE_JUDGE: HBET001_INVITE_JUDGE = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Welcome as a Hubbers Judge',
	view: 'views/emails/invite-judge.html'
}

export const HBET001_INVITE_EXPERT: HBET001_INVITE_EXPERT = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Welcome as a Hubbers Expert',
	view: 'views/emails/invite-expert.html'
}

export const HBET001_WELCOME_INVESTOR: HBET001_WELCOME_INVESTOR = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Welcome as a Hubbers Shareholder!',
	view: 'views/emails/welcome-investor.html'
}

export const HBET001_NOTIFY_SHAREHOLDER: HBET001_NOTIFY_SHAREHOLDER = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Your share value has increased!',
	view: 'views/emails/notify-shareholder.html'
}

export const HBET001_NOTIFY_PRODUCT: HBET001_NOTIFY_PRODUCT = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Your share value has increased!',
	view: 'views/emails/send-product-notification.html'
}

export const HBET007_NOTIFY_NEW_OBSERVER: HBET007_NOTIFY_NEW_OBSERVER = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'We have a new observer joining our observer group',
	view: 'views/emails/notify-new-observer.html'
}

export const HBET007_NOTIFY_NEW_INVESTOR: HBET007_NOTIFY_NEW_INVESTOR = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'We have a new shareholder',
	view: 'views/emails/notify-new-investor.html'
}

export const HBET007_NOTIFY_JUDGE: HBET007_NOTIFY_JUDGE = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'You have new entries to review',
	view: 'views/emails/notify-judge.html'
}

export const HBET007_NOTIFY_CONTESTANT: HBET007_NOTIFY_CONTESTANT = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Your entry has been reviewed!',
	view: 'views/emails/notify-contestant-entry-reviewed.html'
}

export const HBET007_NOTIFY_ADMINS_FOR_NEW_CONTESTANT: HBET007_NOTIFY_ADMINS_FOR_NEW_CONTESTANT = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'We have a new contestant application',
	view: 'views/emails/notify-admin-new-contestant.html'
}

export const HBET007_NOTIFY_ADMINS_FOR_NEW_JUDGE: HBET007_NOTIFY_ADMINS_FOR_NEW_JUDGE = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'We have a new judge application',
	view: 'views/emails/notify-admin-new-jury.html'
}

export const HBET007_NOTIFY_CONTESTANT_FOR_APPROVED: HBET007_NOTIFY_CONTESTANT_FOR_APPROVED = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Your application as a contestant has been approved!',
	view: 'views/emails/notify-contestant-accepted.html'
}

export const HBET007_NOTIFY_JUDGE_FOR_APPROVED: HBET007_NOTIFY_JUDGE_FOR_APPROVED = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Your application as a judge has been approved!',
	view: 'views/emails/notify-jury-accepted.html'
}

export const HBET008_NOTIFY_EXPERT: HBET008_NOTIFY_EXPERT = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'New Expertise Order!',
	view: 'views/emails/notify-experts.html'
}

export const HBET009_RESET_PASSWORD: HBET009_RESET_PASSWORD = {
	name: 'Hubbers',
	from: 'noreply@hubbe.rs',
	subject: 'Password Reset',
	view: 'views/emails/reset-password.html'
}

export type HubbersEmailTemplateType =
	| HBET001_NEW_USER_ADMIN
	| HBET001_NEW_USER_MESSAGE
	| HBET001_INVITE_OBSERVER
	| HBET001_INVITE_CONTESTANT
	| HBET001_INVITE_JUDGE
	| HBET008_NOTIFY_EXPERT
	| HBET001_INVITE_EXPERT
	| HBET001_WELCOME_INVESTOR
	| HBET001_NOTIFY_SHAREHOLDER
	| HBET001_NOTIFY_PRODUCT
	| HBET007_NOTIFY_NEW_OBSERVER
	| HBET007_NOTIFY_NEW_INVESTOR
	| HBET007_NOTIFY_JUDGE
	| HBET007_NOTIFY_CONTESTANT
	| HBET007_NOTIFY_ADMINS_FOR_NEW_CONTESTANT
	| HBET007_NOTIFY_ADMINS_FOR_NEW_JUDGE
	| HBET007_NOTIFY_CONTESTANT_FOR_APPROVED
	| HBET007_NOTIFY_JUDGE_FOR_APPROVED
	| HBET009_RESET_PASSWORD