import { check } from 'express-validator/check'
import * as multer from 'multer'
import * as path from 'path'
import { MediaMetadata, parseImage } from '../controllers/media'
import { StorageUploadedFile, uploadFile } from '../controllers/storage'
import { requestValidator } from '../middlewares/errorHandler'

const mime = require('mime-types')

export interface AssetFile extends File {
	extension: string
}

export interface AssetMetadata { }

const upload = multer({ dest: process.env.WEB_TMP_DIRECTORY + '/' })

/**
 * API to upload assets provided to google cloud
 *
 * @param req Request from Express
 * @param res Response from Express
 */
export const store = async (req, res) => {
	const file: AssetFile = {...req.file, extension: path.extname(req.file.originalname) || 'file'}
	const fileMimeType = mime.lookup(req.file.originalname)

	const isImage = fileMimeType && fileMimeType.indexOf('image') !== -1
	let filesToUpload = [file]

	if (isImage) {
		const metadata: MediaMetadata = JSON.parse(req.body.metadata)
		filesToUpload = await parseImage(file, metadata)
	}

	Promise.all(filesToUpload.map(async (f: AssetFile) => await uploadFile(f)))
		.then((allResponse: [StorageUploadedFile]) => { res.json(allResponse).status(200) })
		.catch(error => { res.json(error).status(400) })
}

export const storeMiddleware = [
	upload.single('file'),
	check('metadata').not().isEmpty(),
	check('metadata').isJSON(),
	requestValidator
]