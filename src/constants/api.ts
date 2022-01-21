// Constant values for API routes
export const API = 'https://new.api.hubbers.io/v2/'
export const KPI_API = API + 'kpi'

export const LINKEDIN_TOKEN_API = 'https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code={code}&client_id={clientId}&client_secret={clientSecret}&redirect_uri={redirectUri}'

// export const LINKEDIN_PROFILE_API = 'https://api.linkedin.com/v2/me?projection=(id,first-name,last-name,picture-url,' + 	'picture-urls::(original),industry,formatted-name,headline,location,summary,' + 'specialties,positions,public-profile-url,email-address)'
export const LINKEDIN_PROFILE_API = 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,country,profilePicture(displayImage~:playableStreams))'

export const LINKEDIN_EMAIL_ADDRESS_API = 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))'

export const HUBBER_BLOGD_API = 'https://blog.hubbers.io/rss'	