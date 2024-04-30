const cheerio = require('cheerio')
const fetch = require('node-fetch')

async function convertVideo(payloadBody = {}) {
	let videoUrl
	let retryCount = 0
	
	while (!videoUrl || retryCount >= 5) {
		const reqConvert = await fetch('https://download.tik-cdn.com/api/json/convert', {
			method: 'POST',
			body: new URLSearchParams({
				...payloadBody,
				ftype: 'mp4',
				fquality: '1080p',
				fname: 'TikDownloader.io',
				audioType: 'audio/mp3'
			})
		})
		if (!reqConvert.ok) throw new Error('\n\n' + await reqConvert.text())
		
		const jsonConvert = await reqConvert.json()
		if (jsonConvert.statusCode !== 300) {
			videoUrl = jsonConvert.result
			continue
		}
		
		retryCount += 1
		await new Promise((resolve) => setTimeout(resolve, 500))
	}
		
	return videoUrl
}

const tiktok = {
	async download(url) {
		const optRequest = {
			method: 'POST',
			body: new URLSearchParams({
				q: url,
				lang: 'en'
			})
		}
		
		const reqAjax = await fetch('https://tikdownloader.io/api/ajaxSearch', optRequest)
		const jsonAjax = await reqAjax.json()
		if (jsonAjax.msg) throw new Error(jsonAjax.msg)
		
		const htmlAjax = jsonAjax.data
		const $ = cheerio.load(htmlAjax)
		const result = {
			description: $('.clearfix h3').text().trim(),
			thumbnail: $('.thumbnail img').attr('src'),
			video: [],
			audio: '',
			image: []
		}
		
		if ($('.photo-list').length) {
			$('.download-box li .download-items').each((idx, el) => {
				const imageUrl = $(el).find('.download-items__btn a').attr('href')
				result.image.push(imageUrl)
			})
			
			result.audio = $('.dl-action p:nth-child(2) a').attr('href')
			
			const videoUrl = await convertVideo({
				audioUrl: result.audio,
				v_id: htmlAjax.match(/value="(.*?)"/)[1],
				exp: htmlAjax.match(/k_exp = "(.*?)"/)[1],
				token: htmlAjax.match(/k_token = "(.*?)"/)[1],
				imageUrl: $('a#ConvertToVideo').attr('data-imagedata')
			})
			result.video.push({ url: videoUrl })
			
		} else {
			$('.dl-action p').each((idx, el) => {
				const dlUrl = $(el).find('a').attr('href')
				if (idx !== 3) {
					result.video.push({
						isHD: idx === 2,
						url: dlUrl
					})
				}
				
				result.audio = dlUrl
			})
		}
		
		return result
	},
	/* TODO
	async stalk(user) {
		
	}
	*/ 
}

module.exports = tiktok
