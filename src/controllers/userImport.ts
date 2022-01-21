import * as bcrypt from 'bcrypt-nodejs'
import * as shortid from 'shortid'
import { HBE004_FAILED_TO_CREATE } from '../constants/errors'
import { ALL_USER_IMPORT } from '../constants/legacyDbSelect'
import { userRole } from '../constants/userRoles'
import { HubbersBaseError } from '../errors'
import { ContestSchemaModel } from '../models/contest'
import { TransactionSchemaModel } from '../models/transaction'
import { UserSchemaModel } from '../models/user'
import LegacyDb from '../utils/legacyDb'

/**
 * Import a set of users from the legacy database
 */
export const importUsersFunction = (userIds: number[]) => {
	return new Promise<any>(async (resolve, reject) => {
		// Import data from legacy DB
		const usersData = await LegacyDb.select(ALL_USER_IMPORT).from('users').whereIn('id', userIds)
		const userRolesData = await LegacyDb.select(ALL_USER_IMPORT).from('role_user').whereIn('user_id', userIds)
		// const creatorsData = await LegacyDb.select(ALL_USER_IMPORT).from('creators').whereIn('user_id', userIds)
		// const expertsData = await LegacyDb.select(ALL_USER_IMPORT).from('experts').whereIn('user_id', userIds)
		const investorsDatas = await LegacyDb.select(ALL_USER_IMPORT).from('investors').whereIn('user_id', userIds)
		const userLinkedinProfiles = await LegacyDb.select(ALL_USER_IMPORT)
			.from('linkedin_profiles').whereIn('user_id', userIds)

		const siteInvestors = await LegacyDb.select(ALL_USER_IMPORT).from('site_investors').whereIn('user_id', userIds)
		const shareBids = await LegacyDb.select(ALL_USER_IMPORT).from('share_bids').whereIn('user_id', userIds)
		const pushAssociations = await LegacyDb.select(ALL_USER_IMPORT).from('push_associations').whereIn('user_id', userIds)
		// Create user object and assign them to the
		const oldAndNewUserIds = []
		let setRole = []
		const updatedUsers = await Promise.all(usersData.map(ud => {
			return UserSchemaModel.findOne({ email: ud.email }).then(async (userExist: any) => {
				const salt = bcrypt.genSaltSync()
				const userPassword = ud.password ? ud.password.replace('$2y', '$2a') : bcrypt.hashSync(shortid.generate(), salt)

				const name = ud.name ? ud.name : ud.email.split('@')[0]
				const user = userExist ? userExist : new UserSchemaModel({
					name, lastName: ud.last_name, email: ud.email, password: userPassword
				})

				// Basic Info
				user.name = name
				user.lastName = ud.last_name
				user.email = ud.email
				user.thumbnailImageUrl = ud.thumbnail_image_url
				user.needsReset = ud.needs_reset
				user.google = ud.google
				user.facebook = ud.facebook
				user.twitter = ud.twitter
				user.wechat = ud.wechat
				user.instagram = ud.instagram
				user.gender = ud.gender
				user.dob = ud.dob
				user.ageGate = ud.age_gate

				user.address = ud.address
				user.phoneNumberCountryCode = ud.contact_number_country_code,
					user.phoneNumber = ud.contact_number
				user.registered = ud.registered
				user.workingContactTime = ud.working_contact_time
				user.contactTime = ud.contact_time

				user.skypeId = ud.skype_id
				user.confirmed = ud.confirmed
				user.phoneVerified = ud.phone_verified
				user.confirmationCode = ud.confirmation_code
				user.bio = ud.bio
				user.rememberToken = ud.remember_token
				user.isTeamMember = ud.is_team_member
				user.legacyId = ud.id
				user.locations = [{
					country: ud.country_residence,
					state: ud.state,
					city: ud.city
				}]

				user.positions = [{
					title: ud.position
				}]

				// APN Migration
				if (pushAssociations.length > 0) {
					const apnData = pushAssociations.find((apn) => apn.user_id === ud.id)
					if (apnData) {
						user.pushAssociation = {
							type: apnData.type,
							token: apnData.token,
							createdAt: apnData.created_at,
							updatedAt: apnData.updated_at
						}
					}
				}

				// Linkedin Info
				const linkedinProfile = userLinkedinProfiles.find(ulp => ulp.user_id === ud.id)
				if (linkedinProfile) {
					user.linkedinToken = linkedinProfile.linkedin_token
					user.linkedinProfileUrl = linkedinProfile.profile_url
					user.specialties = [linkedinProfile.specialties]
					user.summary = linkedinProfile.summary
				}

				// Investors based info
				const investorsData = investorsDatas.find(uli => uli.user_id === ud.id)
				if (investorsData) {
					user.investorInvestmentBudget = investorsData.investment_budget
					user.investorInvestmentGoal = investorsData.investment_goal
					user.investorInvestmentReason = investorsData.investment_reason
				}

				// Site Investors flag
				user.isHubbersInvestor = siteInvestors.find(sli => sli.user_id === ud.id) !== null
				
				user.capabilities = []
				if (user.isHubbersInvestor) {
					user.capabilities.push('site-investor')
				}

				// Role based info
				if (userRolesData.length) {
					const found = userRolesData.filter(ul => ul.user_id === ud.id)
					found.forEach((r) => {
						const foundRole = userRole.filter((ur) => ur.id === r.role_id)
						if (foundRole.length) {
							setRole.push(foundRole[0].name)
						}
					})
					user.roles = setRole
					setRole = []
				}

				const savedUser = await user.save()

				if (shareBids.length) {
					const shareBid = shareBids.filter(sb => sb.user_id === ud.id)
					
					// Remove all share transactions
					await TransactionSchemaModel.remove({ user: savedUser._id })
					await Promise.all(shareBid.map(async sb => {
						const transaction = new TransactionSchemaModel({
							user: savedUser._id,
							amount: sb.num_shares,
							currency: 'hbs',
							type: 'token-purchase',
							usdAmount: sb.bid_amount,
							status: 'COMPLETED',
							createdAt: sb.created_at,
							updatedAt: sb.updated_at
						})

						return transaction.save()
					}))
					user.shares = []
					// user.shares = shareBid.map((sb) => {
					// 	sb.numShares = sb.num_shares
					// 	sb.bidAmount = sb.bid_amount
					// 	sb.createdAt = sb.created_at
					// 	sb.updatedAt = sb.updated_at
					//
					// 	delete sb.id
					// 	delete sb.user_id
					// 	delete sb.share_listing_id
					// 	delete sb.num_shares
					// 	delete sb.bid_amount
					// 	delete sb.created_at
					// 	delete sb.updated_at
					//
					// 	return sb
					// })
				}

				await user.save().then((u) => {
					oldAndNewUserIds.push({ legacyId: u.legacyId, id: u._id.toString() })
					return user
				})
			}).catch((error: any) => reject(new HubbersBaseError(HBE004_FAILED_TO_CREATE, error)))
		}))

		resolve(await updatingExistingIds(oldAndNewUserIds))
	})
}

const updatingExistingIds = (objectIds) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.find().then(async (contests: any) => {
			if (contests.length > 0) {
				contests.map(async (contest: any) => {
					if (contest.contestants.length) {
						contest.contestants.map(async (contestant) => {
							const found = objectIds.filter((ids) => ids.legacyId == contestant.id)
							if (found.length > 0) {
								contestant.user = found[0].id
							}
							return contestant
						})
					}

					if (contest.judges.length) {
						contest.judges.map(async (judge) => {
							const found = objectIds.filter((ids) => ids.legacyId == judge.id)
							if (found.length > 0) {
								judge.user = found[0].id
							}
							return judge
						})
					}

					if (contest.entries.length) {
						contest.entries.map(async (entry) => {
							const found = objectIds.filter((ids) => ids.legacyId == entry.contestantId)
							if (found.length > 0) {
								// entry.contestantId = found[0].id
								entry.contestant = found[0].id
							}
							if (entry.ratings.length) {
								entry.ratings.map(async (rating) => {
									const foundJudge = objectIds.filter((ids) => ids.legacyId == rating.judgeId)
									if (foundJudge.length > 0) {
										// rating.judgeId = foundJudge[0].id
										rating.judge = foundJudge[0].id
									}
									return rating
								})
							}
							return entry
						})
					}

					if (contest.likes.length) {
						const likeIds = contest.likes
						objectIds.map(async (i) => {
							const index = likeIds.indexOf(i.legacyId)
							if (index !== -1) {
								likeIds[index] = i.id
							}
						})

						contest.likes = likeIds
					}

					return await contest.save()
				})
				resolve([{ msg: 'Migration successfully' }])
			} else { resolve([]) }
		})
	})
}