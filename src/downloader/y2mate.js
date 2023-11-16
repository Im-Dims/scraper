const fetch = require('#utils/fetcher')

const fetchPost = (url, form, headers) => (fetch(url, {
	method: 'POST',
	body: new URLSearchParams(form),
	headers
}))

module.exports = async (url) => {
	const htmlToken = await (await fetch('https://y2mate.is/')).text()
	const csrfToken = (htmlToken.match(/token" content="(.*?)"/) || '')[1]
	if (!csrfToken) throw new Error('Failed to get csrf-token')
	
	const headers = {
		'X-CSRF-TOKEN': csrfToken,
		Referer: 'https://y2mate.is/'
	}
	const request = await fetch(`https://srvcdn3.2convert.me/api/json?url=${url}`, { headers })
	if (!request.ok) throw new Error('\n\n' + await request.text())
	
	const reqJson = await request.json()
	if (reqJson.error) throw new Error(JSON.stringify(reqJson))
	
	const { lengthSeconds, duration } = reqJson.formats
	const result = {
		...reqJson.formats,
		lengthSeconds: +lengthSeconds,
		duration: new Date(duration * 1000).toUTCString().split(' ')[4],
		video: {},
		audio: {}
	}
	
	for (const type of ['video', 'audio']) {
		reqJson.formats[type].forEach((data) => {
			const { quality: q, fileType, needConvert, fileSize, url: dlUrl } = data
			const quality = type === 'video' ? q : `${q}kbps`
			
			result[type][quality] = {
				quality,
				fileType,
				fileSizeH: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
				fileSize,
				needConvert,
				download: !needConvert ? dlUrl : async (raw = false) => {
					const reqTaskId = await fetchPost('https://srvcdn3.2convert.me/api/json', { hash: dlUrl }, headers)
					if (!reqTaskId.ok) throw new Error('\n\n' + await reqTaskId.text())
					
					const reqTaskJson = await reqTaskId.json()
					if (reqTaskJson.error) throw new Error(JSON.stringify(reqTaskJson))
					
					const { taskId } = reqTaskJson
					const fetchTaskId = await fetchPost('https://srvcdn3.2convert.me/api/json/task', { taskId }, headers)
					const fetchTaskJson = await fetchTaskId.json()
					
					return raw ? fetchTaskJson : fetchTaskJson.download
				}
			}
		})
	}
	
	return result
}
