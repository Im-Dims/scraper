const fetch = require('#utils/fetcher')

async function savefree({ url, type }) {
	const optRequest = {
		method: 'POST',
		body: new URLSearchParams({
			type,
			resource: 'save',
			instagram_url: url
		}),
		headers: {
			'X-Valy-Cache': 'accpted',
			'X-Requested-With': 'XMLHttpRequest',
			'User-Agent': 'WhatsApp/1.2.3',
			'Set-Fetch-Site': 'same-origin',
			'Set-Fetch-Mode': 'cors',
			'Set-Fetch-Dest': 'empty',
			'Referer': 'https://www.save-free.com/'
		}
	}
	
	const reqProcess = await fetch('https://www.save-free.com/process', optRequest)
	const reqType = reqProcess.headers.get('content-type')
	if (!/json/.test(reqType)) throw new Error('\n\n' + await reqProcess.text())
	
	const jsonResponse = await reqProcess.json()
	return jsonResponse
}

module.exports = {
	async download(url) {
		return savefree({ url, type: 'media' })
	},
	async stalk(user = '') {
		return savefree({ url: user.replace(/^@/, ''), type: 'profile' })
	}
}
