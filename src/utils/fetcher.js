let fetcher = globalThis.fetch
if (!fetcher) {
	return getFetch()
}

async function getFetch() {
	const fetchModule = await import('node-fetch')
	return fetcher = fetchModule.default
}

module.exports = fetcher
