import * as GoogleCloudStorage from '@google-cloud/storage'
import * as AliOSS from 'ali-oss'
import * as S3 from 'aws-sdk/clients/s3'
import * as co from 'co'
import * as ShortID from 'shortid'
import * as fs from 'fs'

export interface StorageUploadedFile {
	name: string,
	originalName: string,
	url: string
}

/**
 * Upload file to a selected storage service
 *
 * Supported Services :
 *
 * 1. Google Cloud Storage
 *    - GOOGLE_CLOUD_STORAGE_BUCKET
 *    - GOOGLE_PROJECT_ID
 *
 * 2. Aliyun OSS
 *    - ALIYUN_ACCESS_KEY
 *    - ALIYUN_ACCESS_KEY_SECRET
 *
 */
export const uploadFile = (file: any, name?: string) => {
	return new Promise((resolve, reject) => {
		const storageType = process.env.STORAGE

		let targetName = name
		if (!targetName) {
			targetName = ShortID.generate()

			const filenameSplit = file.originalname.split('.')
			if (filenameSplit.length > 0) { targetName += '.' + filenameSplit[1] }
		}

		switch (storageType) {
			case 'GOOGLE':
				const storage = new GoogleCloudStorage({ projectId: process.env.GOOGLE_PROJECT_ID })
				storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET).upload(file.path, {
					destination: targetName,
					metadata: {
						contentType: file.mimetype
					}
				})
					.then((response: any) => {
						const uploadedFile = response[0]
						resolve({
							name: uploadedFile.name,
							originalName: file.originalname,
							url: 'https://storage.googleapis.com/' + uploadedFile.bucket.name + '/' + uploadedFile.name
						})
					})
					.catch((error: any) => reject(error))
				break
			case 'ALIYUN':
				const aliyunStore = AliOSS({
					accessKeyId: process.env.ALIYUN_ACCESS_KEY,
					accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
					bucket: process.env.ALIYUN_STORAGE_BUCKET,
					region: process.env.ALIYUN_STORAGE_REGION
				})

				co(function*() { return yield aliyunStore.put(targetName, file.path) })
					.then(response => resolve({
						name: response.name,
						originalName: file.originalname,
						url: response.url.replace('http://', 'https://')
					}))
					.catch(error => reject(error))
				break
			case 'S3':
				const s3 = new S3({
					accessKeyId: process.env.AWS_ACCESS_KEY,
					secretAccessKey: process.env.AWS_ACCESS_SECRET
				})
				
				fs.readFile(file.path, (readErr, data) => {
					if (readErr) { reject(readErr) } else {
						s3.putObject({
							Bucket: process.env.AWS_STORAGE_BUCKET,
							Key: targetName,
							Body: data,
							ACL: 'public-read'
						}, (err, response) => {
							if (err) { reject(err) } else {
								console.log('S3 response', response)
								resolve({
									name: file.originalname,
									originalName: file.originalname,
									url: ` https://hubbers-api.s3-ap-northeast-1.amazonaws.com/${targetName}`,
									...response
								})
							}
						})
					}
				})
				break
		}
	})
}