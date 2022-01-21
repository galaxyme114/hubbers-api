import { Document, Model, model, Schema} from 'mongoose'
import { PurchaseOrderRecord } from '../interfaces/purchaseOrder'

/**
 * Purchase Order
 */
export interface PurchaseOrderModel extends PurchaseOrderRecord, Document {}
export const PurchaseOrderSchema: Schema = new Schema({
	sku: String,
	name: String,
	description: String,
	price: Number,
	currency: String,
	status: Boolean,
	chargeId: String,
	date: Date
})

export const PurchaseOrderSchemaModel: Model<PurchaseOrderModel> =
	model<PurchaseOrderModel>('PurchaseOrder', PurchaseOrderSchema)