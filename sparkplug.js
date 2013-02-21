/*
 * Sparkplug.js - Minimalistic initializer for AMD modules
 * 
 * Public Domain. Use, modify and distribute it any way you like. No attribution required.
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 *
 * Sparkplug.js is a very small implementation of the AMD specification. It does not load asynchronously,
 * but expects modules to be in the same source. See README.md for more.
 */
(function(_window) {
	var RECURSION_DEPTH = 32;  // maximum recursion depth for dependencies
	var REQUIRE = 'require';         
	var EXPORTS = 'exports';
	var MODULE = 'module';
	var modules = {}; // stores id: {d: ['dependency', 'dependency'], f: factoryfunction(){}, x: {exports}, l: <loadingflag>}

	function isType(s,o) {
		return typeof s == o;
	}
	function isString(s) {
		return isType(s, 'string');
	}
	function isFunction(f) {
		return isType(f, 'function');
	}
	function isList(v) {
		return v && v.length != null && !isString(v) && !isFunction(v);
	}
		
	function resolvePath(path, base) {
		var pathSteps = path.split('/');
		if (pathSteps[0] == '.' || pathSteps[0] == '..')  {
			var newPath = base.split('/');
			for (var i = 0; i < pathSteps.length; i++)  {
				var step = pathSteps[i] 
				if (step == '.')
					newPath.pop();
				else if (step == '..') {
					newPath.pop();
					newPath.pop();
				}
				else
					base.push(step);
			}
			return newPath.join('/');
		}
		else
			return path;
	}

	var define =_window['define'] = function(id, dependencies) { // third arg is factory, but accessed using arguments..
		modules[isString(id) ? id : ''] = {
				'd': isList(id) ? id : (isList(dependencies) ? dependencies : [REQUIRE, EXPORTS, MODULE]),  // dependencies
				'f': arguments[arguments.length-1] // factory
		};
	};
	define['amd'] = {};

	function requireInternal(id, baseId, recursionsLeft) { 
		var modDepExports = [];  // array corresponding to mod.d, containing resolved dependencies
		var topLevelId = resolvePath(id, baseId);
		var mod = modules[topLevelId];
		var exportObj = {}; 
		
		if (!mod)
			throw new Error('Cant find '+id);
		if (mod['x'])
			return mod['x'];
		if (mod['l'] || !recursionsLeft)
			throw new Error('Circular Deps');

		for (var i = 0; i < mod['d'].length; i++) {
			var modDepId = mod['d'][i];
			if (modDepId == REQUIRE)
				modDepExports[i] = createExportRequire(modDepId); 
			else if (modDepId == EXPORTS)
				modDepExports[i] = exportObj;
			else if (modDepId == MODULE)
				modDepExports[i] = {'id': topLevelId};
			else
				modDepExports[i] = requireInternal(modDepId, id, recursionsLeft-1);
		}

		mod['l'] = 1;
		mod['x'] = isFunction(mod['f']) ? (mod['f'].apply(_window, modDepExports) || exportObj) : mod['f'];
		mod['l'] = 0;
		return mod['x'];
	}

	function createExportRequire(baseId) {
		return function r(id, callback) { 
			if (isList(id)) {
				var deps = [];
				for (var i = 0; i < id.length; i++)
					deps.push(r(id[i]));
				if (isFunction(callback))
					callback.apply(null, deps);
			} 
			else
				return requireInternal(id, baseId, RECURSION_DEPTH); 
		}; 	
	}
	_window[REQUIRE] = createExportRequire('');
})(this);


