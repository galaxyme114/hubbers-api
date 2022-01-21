// Legacy DB Select

export const USER_SELECT = ['id', 'name', 'last_name', 'thumbnail_image_url', 'position']
export const ALL_USER_IMPORT = ['*']

export const USER_POPULATE_SELECT = '_id name lastName fullName email thumbnailImageUrl headline industry'
export const USER_PUBLIC_FIELD = '_id name thumbnailImageUrl createdAt positions associatedCommunity'
export const USER_FULL_PUBLIC_FIELD = '_id name thumbnailImageUrl projectCounts locations skills createdAt contestCount positions attendedEvent eventVisitedCount bio languages'

export const USER_POPULATE_SELECT_ARRAY = USER_POPULATE_SELECT.split(' ')
export const USER_FULL_PUBLIC_FIELD_ARRAY = USER_FULL_PUBLIC_FIELD.split(' ')

export const USER_PUBLIC_FIELD_ARRAY = USER_PUBLIC_FIELD.split(' ')

export const USER_POPULATE_PUBLIC = '_id name lastName fullName email thumbnailImageUrl headline industry'
export const USER_POPULATE_PUBLIC_ARRAY = USER_POPULATE_SELECT.split(' ')