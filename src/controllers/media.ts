import * as Jimp from 'jimp'
import { AssetFile, AssetMetadata } from '../routes/assets'

export interface MediaMetadata extends AssetMetadata {
	dimensions: {
		width: number,
		height: number,
		crop?: boolean
	},
	uploadOrientation?: number
}

/**
 * Parse media files and crop them by the defined dimensions
 *
 */
export const parseImage = (file, metadata: MediaMetadata) => {
	return new Promise<[AssetFile]>((resolve, reject) => {
		// Return the source file if no resize is required

		if (!metadata) {
			resolve([file])
		} else {
			// Get the formatted size if resizing is required
			const formattedSize = {
				width: metadata.dimensions.width ? metadata.dimensions.width : Jimp.AUTO,
				height: metadata.dimensions.height ? metadata.dimensions.height : Jimp.AUTO
			}

			const formattedFileName = file.filename.replace(/\.[^/.]+$/, '')
			const resizedFileName = formattedFileName + '-' + formattedSize.width + 'x' +
				formattedSize.height + '.' + file.extension
			const resizedFilePath = process.env.WEB_TMP_DIRECTORY + '/' + resizedFileName

			Jimp.read(file.path, (err, image) => {
				if (!err && image) {
					// Correct uploaded orientation
					if (metadata.uploadOrientation) {
						image = image.rotate(getRotationByUploadOrientation(metadata.uploadOrientation))
					}

					// Crop orientation
					if (metadata.dimensions.crop) {
						image = image.cover(formattedSize.width, formattedSize.height,
							Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
					} else {
						if (metadata.dimensions.height) {
							image = image.contain(formattedSize.width, formattedSize.height,
								Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
						} else {
							image = image.resize(formattedSize.width, formattedSize.height)
						}
					}

					image.write(resizedFilePath, () => {
						file.path = resizedFilePath
						file.filename = resizedFileName

						resolve([file])
					})
				} else {
					reject(err)
				}
			}).catch((err) => { reject(err) })
		}
	})
}

const getRotationByUploadOrientation = (uploadOrientation: number) => {
	return uploadOrientation === 6 ? 90 : 0
}