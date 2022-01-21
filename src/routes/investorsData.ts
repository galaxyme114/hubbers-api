import axios, { AxiosAdapter } from 'axios'
import { setupCache } from 'axios-cache-adapter'

import { KPI_API} from '../constants/api'
import { HBE003_FAILED_TO_FETCH, HBE004_FAILED_TO_CREATE } from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { InvestorNewSharesNotification } from '../events/investors'
import { NotifyNewInvestor } from '../events/notify'
import { UserSchemaModel } from '../models/user'
import { getNumberWithCommas } from '../utils/currency'
import { TransactionModel, TransactionSchemaModel } from '../models/transaction'

const cache = setupCache({ maxAge: 30 * (24 * 60 * 60 * 1000) })
const http = axios.create({ adapter: cache.adapter as AxiosAdapter })

/**
 * Express route for fetching investors data from multiple APIs
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const fetch = (req, res, next) => {
	// Fetch all investors public data from multiple APIs
	doFetchInvestorsData()
		.then(response => res.json(response))
		.catch((error: any) => { next(new HubbersBaseError(HBE003_FAILED_TO_FETCH, error)) })
}

const doFetchInvestorsData = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const kpi = await http.get(KPI_API).then(response => response.data)
			const investors = []
			const observers = []
			const totalShares: number = 10000000
			const currentShareValue: number = kpi['current-share-value']
			
			// TODO: Find investors and observers with APIs, capability of site-investor
			const allTokenPurchase = await TransactionSchemaModel.find({ currency: 'hbs', type: 'token-purchase' })
			const siteInvestors = await UserSchemaModel.find({ capabilities: 'site-investor' }, {})
			siteInvestors.map(siteInvestor => {
				// TODO: get total HBS value
				const userTransactions = allTokenPurchase.filter((tokenPurchase: TransactionModel) =>
					tokenPurchase.user ? tokenPurchase.user.toString() === siteInvestor._id.toString() : null)
				
				if (userTransactions.length > 0) {
					let totalHbs = 0
					userTransactions.map(ut => totalHbs += ut.amount)
					investors.push({ userId: siteInvestor._id, numShares: totalHbs, user: siteInvestor })
				} else {
					observers.push({ userId: siteInvestor._id, numShares: 0, user: siteInvestor })
				}
			})
			resolve({ currentShareValue, totalShares, kpi, investors, observers })
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Express route for adding and updating shares for a user
 *
 * @param req Request from Express
 * @param res Response from Express
 * @param next
 */
export const addShares = (req, res, next) => {
	// req.body.numShares  
	// req.body.bidAmount  
	const shareData = req.body
	const userId = req.user._id
	
	doAddShares(userId, shareData)
		.then((response: any) => {
			const newSharesData: InvestorNewSharesNotification = {
				id: response._id.toString(),
				email: response.email,
				name: response.name,
				shares: response.shares[0].numShares,		//  [shares] in monngoose 
				shareValue: response.shares[0].bidAmount
			}
			
			res.app.emit('welcome:investor', newSharesData)

			const newInvestor: NotifyNewInvestor = {
				id:  response._id.toString(),
				name: response.fullName,
				thumbnailImageUrl: response.thumbnailImageUrl ? response.thumbnailImageUrl :
					'https://ui-avatars.com/api/?background=333333&size=200&font-size=0.4&color=fff&name=' +
					response.fullName.replace(/ /g, '+'),
				nationality: response.locations[0].country,
				shares: getNumberWithCommas(response.numShares)
			}
			res.app.emit('notify:new-investor', newInvestor)
			res.json(response)
		})
		.catch(error => next(new HubbersBaseError(HBE004_FAILED_TO_CREATE)))
}

const doAddShares = (userId: string, shareData: any) => {
	return new Promise(async (resolve, reject) => {
		// Is existing shareholder, don't send twice
		await UserSchemaModel.findOneAndUpdate({ _id: userId }, { $push: { shares: shareData } })
			.then((share) => resolve(share))
			.catch(error => reject(error))
	})
}