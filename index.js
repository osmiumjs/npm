const axios = require('axios');
const oTools = require('osmium-tools');

class OsmiumNPM {
	constructor(repo = 'https://registry.npmjs.org') {
		this.repo = repo;
	}

	async fetch(name) {
		try {
			const ret = await axios.get(`${this.repo}/${name}`);
			return ret && ret.data ? ret.data : false;
		} catch (e) {
			return false;
		}
	}

	async versions(name) {
		const ret = await this.fetch(name);
		if (!ret) return false;

		return Object.keys(ret.versions);
	}

	filterPackageInfo(pkg) {
		return {
			author         : pkg.author,
			dependencies   : pkg.dependencies ? pkg.dependencies : {},
			description    : pkg.description,
			devDependencies: pkg.devDependencies ? pkg.devDependencies : {},
			dist           : pkg.dist,
			gitHead        : pkg.gitHead ? pkg.gitHead : false,
			license        : pkg.license,
			maintainers    : pkg.maintainers ? pkg.maintainers : [], name: pkg.name,
			repository     : pkg.repository ? pkg.repository : false,
			tar            : pkg.dist.tarball,
			version        : pkg.version
		};
	}

	async info(name) {
		const ret = await this.fetch(name);
		if (!ret) return false;

		const packages = oTools.iterate(ret.versions, (pkg) => this.filterPackageInfo(pkg), {});
		const lastVer = ret['dist-tags'].latest;
		const time = oTools.iterate(ret.time, (ts, idx) => idx === 'created' || idx === 'modified' ? undefined : new Date(ts), {});

		return {
			name          : ret.name,
			versions      : Object.keys(ret.versions),
			packages      : packages,
			currentVersion: lastVer,
			current       : packages[lastVer],
			time,
			created       : new Date(ret.time.created),
			modified      : new Date(ret.time.modified),
			license       : ret.license,
			author        : ret.author,
			readme        : ret.readme === 'ERROR: No README data found!' ? false : ret.readme
		};
	}
}

module.exports = OsmiumNPM;
