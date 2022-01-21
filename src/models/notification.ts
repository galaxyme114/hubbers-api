import { Document, Model, model, Schema} from 'mongoose'
import { Notification } from '../interfaces/notification'

/**
 * Model for Notifications
 */
export interface NotificationModel extends Notification, Document {}
export const NotificationSchema: Schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	message: String,
	key: String,
	keyId: String,
	isSeen: {
		type: Boolean,
		/* tslint:disable */'default': false /* tslint:enable */
	}
}, {
	timestamps: true
})

export const NotificationSchemaModel: Model<NotificationModel> =
	model<NotificationModel>('Notification', NotificationSchema)