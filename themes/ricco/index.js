exports.install = function() {
	F.merge('/ricco/css/default.css', '/css/ui.css', '=ricco/public/css/default.css');
	F.merge('/ricco/js/default.js', '/js/jctajr.min.js', '/js/ui.js', '=ricco/public/js/default.js');
	F.localize('/ricco/templates/*.html', ['compress']);
};