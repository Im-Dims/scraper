const FormData = require('form-data')
const fetch = require('#utils/fetcher')

module.exports = async (imageBuffer, expiredTime = '', fileName = '') => {
	const listExpTime = [
		'', // no expired time
		'PT5M', 'PT15M', 'PT30M', // exp in minutes
		'PT1H', 'PT3H', 'PT6H', 'PT12H', // exp in hours
		'P1D', 'P2D', 'P3D', 'P4D', 'P5D', 'P6D', // exp in days
		'P1W', 'P2W', 'P3W', // exp in weeks
		'P1M', 'P2M', 'P3M', 'P4M', 'P5M', 'P6M' // exp in months
	]
	if (!listExpTime.includes(expiredTime)) throw new Error('Invalid expiration time')
	
	const reqToken = await fetch('https://imgbb.com/')
	const htmlToken = await reqToken.text()
	const authToken = (htmlToken.match(/auth_token="(\w+)"/) || '')[1]
	if (!authToken) throw new Error('Failed to get auth token')
	
	const timeNow = Date.now()
	fileName = fileName || timeNow.toString(16) + '.jpg'
	
	const formData = new FormData()
	formData.append('source', imageBuffer, fileName)
	formData.append('type', 'file')
	formData.append('action', 'upload')
	formData.append('timestamp', timeNow)
	formData.append('auth_token', authToken)
	formData.append('expiration', expiredTime)
	
	const reqUpload = await fetch('https://imgbb.com/json', {
		method: 'POST',
		body: formData.getBuffer(),
		headers: {
			cookie: reqToken.headers.get('set-cookie'),
			...formData.getHeaders()
		}
	})
	if (!reqUpload.ok) throw new Error('\n\n' + await reqUpload.text())
	
	const jsonResponse = await reqUpload.json()
	if (jsonResponse.error) throw new Error(jsonResponse.status_txt)
	
	return jsonResponse 
}
