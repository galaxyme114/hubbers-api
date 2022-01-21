/**
 * Check for APP Updates
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const fetch = (req, res) => {
	const currentVersion = req.query.currentVersion
	const deviceOS = req.query.deviceOS
	const latestVersion = process.env.LATEST_APP_VERSION
	
	if (currentVersion < latestVersion) {
		res.json({
			updateAvailable: true,
			updateVersion: latestVersion,
			updateType: deviceOS === 'ios' ? 'appstore' : 'apk',
			updateLink: deviceOS === 'ios' ? 'https://itunes.apple.com/gb/app/hubbers-hub-of-makers/id1377168527' :
				'https://hubbers-hk.oss-cn-hongkong.aliyuncs.com/APP/latest/Hubbers-latest.apk'
		})
	} else {
		res.json({
			updateAvailable: false
		})
	}
}
