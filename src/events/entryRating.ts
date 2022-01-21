import { HBE006_FAILED_TO_UPDATE } from '../constants/errors'
import { HubbersBaseError } from '../errors'
import { ContestSchemaModel } from '../models/contest'

export const newEntryRating = async (contestId: string) => {
	return new Promise((resolve, reject) => {
		ContestSchemaModel.findById(contestId)
			.then(async (contest: any) => {
				try {
					const contestantIds = contest.contestants.map(c => c.id)

					const contestants = contestantIds.map(contestantId => {
						const entries = contest.entries.filter(entry => entry.contestantId === contestantId && !entry.isDraft)
						const latestEntry = entries[entries.length - 1]

						let designAvgRating = 0
						let functionalityAvgRating = 0
						let usabilityAvgRating = 0
						let marketPotentialAvgRating = 0

						if (latestEntry && latestEntry.ratings) {
							latestEntry.ratings.map(rat => {
								designAvgRating += rat.design
								functionalityAvgRating += rat.functionality
								usabilityAvgRating += rat.usability
								marketPotentialAvgRating += rat.marketPotential
							})

							const allRatings = {
								design: designAvgRating / latestEntry.ratings.length,
								functionality: functionalityAvgRating / latestEntry.ratings.length,
								usability: usabilityAvgRating / latestEntry.ratings.length,
								marketPotential: marketPotentialAvgRating / latestEntry.ratings.length
							}

							return {
								id: contestantId,
								avgMark: (allRatings.design + allRatings.functionality +
									allRatings.usability + allRatings.marketPotential) / 4
							}
						}
					})

					contestants.sort((a, b) => b.avgMark - a.avgMark)

					contest.contestants.map(c => {
						contestants.map((acr: any, i: number) => {
							if (acr && c.id === acr.id) {
								const nextRank = acr.avgMark ? (i + 1) : 0
								if (nextRank !== c.currentRank) {
									c.previousRank = c.currentRank
									c.currentRank = nextRank
								}
							}
						})
						return c
					})

					await contest.save()
					resolve()
				} catch (error) {
					reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error))
				}
			}).catch(error => reject(new HubbersBaseError(HBE006_FAILED_TO_UPDATE, error)))
	})
}