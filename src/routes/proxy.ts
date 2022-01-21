import * as request from 'request'

/**
 * Proxy route for avoiding CORS and same domain issue
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const proxy = (req, res) => {
	const urlSplit = req.url.split('?url=')

	if (urlSplit.length === 2) {
		req.pipe(request(urlSplit[1])).on('response', (newRes: Response) => {
			delete newRes.headers['x-frame-options']
			delete newRes.headers['X-Frame-Options']
			delete newRes.headers['content-security-policy']
		}).pipe(res)
	} else {
		res.send('Invalid Request')
	}
}