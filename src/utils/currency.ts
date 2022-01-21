import { Currency } from '../constants/enums'

export const getNumberWithCommas = (num: number, decimals?: number): string => {
	return num.toFixed(decimals).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const convertCurrencyToUSD = (amount: number, currency: string) => {
	switch (currency) {
		case Currency.HBB: return amount * 0.01
		case Currency.HBS: return amount
		default: return amount
	}
}