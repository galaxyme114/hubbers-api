export const trimAll = (arrayToTrim: [string]) => arrayToTrim.map(a => capitalize(a.trim()))

export const capitalize = (subject) => {
	return subject.charAt(0).toUpperCase() + subject.slice(1)
}

export const slugify = (subject) => {
	return subject.toString().toLowerCase()
		.replace(/\s+/g, '-')           // Replace spaces with -
		.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
		.replace(/\-\-+/g, '-')         // Replace multiple - with single -
		.replace(/^-+/, '')             // Trim - from start of text
		.replace(/-+$/, '')             // Trim - from end of text
}

export const filterObject = (subject, keys) => {
	const matchingKeys = Object.keys(subject).filter(k => keys.indexOf(k) !== -1)
	const matchingObject = {}
	matchingKeys.map(mk => matchingObject[mk] = subject[mk])

	return matchingObject
}