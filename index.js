const fs = require('fs')
const path = require('path')

let listModules = {}
if (!Object.keys(listModules).length) {
	return loadModules(path.join(__dirname, 'src'))
}

async function loadModules(folder) {
	for (const dir of fs.readdirSync(folder)) {
		if (dir === 'utils') continue
		const dirname = path.join(folder, dir)
		try {
			const stat = fs.statSync(dirname)
			if (stat.isDirectory()) {
				loadModules(dirname)
			} else if (stat.isFile() && dirname.endsWith('.js')) {
				const moduleName = path.basename(dirname).replace('.js', '')
				listModules[moduleName] = require(dirname)
			}
		} catch (e) {
			console.log(e)
			delete listModules[dirname]
		} finally {
			return listModules = Object.fromEntries(
				Object.entries(listModules).sort(([a], [b]) => a.localeCompare(b))
			)
		}
	}
}

module.exports = listModules
