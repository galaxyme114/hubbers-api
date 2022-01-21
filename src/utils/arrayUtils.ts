
export const flatten = (subject: any) => {
	return subject.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
}
