namespace core {
	export function urlVersion(url: string, version: string, versionParam: string = 'ver')
	{
		let urls = url.split('#', 2);
		url = urls[0];
		let hash = urls.length > 1 ? '#' + urls[1] : '';

		if (url.indexOf('?') < 0)
			return url + '?' + versionParam + '=' + version + hash;

		let pattern = new RegExp('([\\?&]' + versionParam+'=)([^\\?&=]*|$)', 'i');
		if (pattern.test(url)) {
			return url.replace(pattern, '$1' + version) + hash;
		} else {
			return url + '&' + versionParam + '=' + version + hash;
		}
	}
}