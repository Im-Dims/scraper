const fetch = require('#utils/fetcher')

module.exports = async (emoji) => {
	const request = await fetch(`https://emojipedia.org/${emoji}`)
	if (!request.ok) throw new Error(request.statusText)
	
	const html = await request.text()
	const splitHtml = html.split('"vendorsAndPlatforms":')[1].split(',"alerts"')[0]
	const emojiList = JSON.parse(splitHtml)
	
	for (const vendor of emojiList) {
		const { description } = vendor
		vendor.description = description.replace(/<\/?p>/g, '')
		
		for (const emoji of vendor.items) {
			const { image: { source } } = emoji
			emoji.image.source = `https://em-content.zobj.net/${source}`
		}
	}
	
	return emojiList
}
