import { Currency } from '../constants/enums'

export interface Purchasable {
	sku: string
}

export interface PurchaseOrderRecord {
	sku: string,
	name: string,
	description: string,
	price: number,
	currency: Currency,
	status: boolean,
	chargeId: string,
	date: Date
}