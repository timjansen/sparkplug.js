/*
 * Sparkplug.js - Tiny initializer for AMD modules
 * 
 * Public Domain. Use, modify and distribute it any way you like. No attribution required.
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 *
 * Sparkplug.js is a very small implementation of the AMD specification. It does not load asynchronously,
 * but expects modules to be in the same source. See README.md for more or visit
 * https://github.com/timjansen/sparkplug.js 
 */
// ==ClosureCompiler==
// @output_file_name sparkplug.min.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// ==/ClosureCompiler==

(function(_window) {
	var RECURSION_DEPTH = 32;  // maximum recursion depth for dependencies
	var REQUIRE = 'require';         
	var EXPORTS = 'exports';
	var MODULE = 'module';
	var modules = {}; // stores id -> {d: ['dependency', 'dependency'], f: factoryfunction(){}, x: {exports}, l: <loadingflag>}
	var anonymousIdIndex = 0;   // provides names for anonymous modules
	var amd = {'ids':[], 'anonIds': []};       // define.amd content

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
	
	function each(list, f) {
		for (var i = 0; i < list.length; i++)
			f(list[i], i);
	}
	
	function resolvePath(path, base) {
		if (/^\.\.?\//.test(path))  {
			var step;
			var newPath = base.split('/');
			newPath.pop();
			each(path.split('/'), function(step) {
				if (step == '..')
					newPath.pop();
				else if (step != '' && step != '.')
					newPath.push(step);
			});
			return newPath.join('/');
		}
		else
			return path;
	}

	function requireInternal(id, baseId, recursionsLeft) { 
		var modDepExports = [];  // array corresponding to mod.d, containing resolved dependencies
		var topLevelId = resolvePath(id, baseId);
		var mod = modules[topLevelId];
		var modulesObj = {'id': topLevelId, 'exports': {}};

		each(amd['anonIds'], function(anonId, i) {
			if (topLevelId == anonId)
				mod = modules[i];
		});	
		if (!mod || mod['l'] || !recursionsLeft)
			throw new Error(mod ? 'Circular Deps' : 'Cant find '+id);
		if (mod['x'])
			return mod['x'];
		
		each(mod['d'], function(modDepId, i) {
			if (modDepId == REQUIRE)
				modDepExports[i] = createExportRequire(topLevelId); 
			else if (modDepId == EXPORTS)
				modDepExports[i] = modulesObj[EXPORTS];
			else if (modDepId == MODULE)
				modDepExports[i] = modulesObj;
			else
				modDepExports[i] = requireInternal(modDepId, topLevelId, recursionsLeft-1);
		});

		mod['l'] = 1;
		mod['x'] = isFunction(mod['f']) ? (mod['f'].apply(_window, modDepExports) || modulesObj[EXPORTS]) : mod['f'];
		mod['l'] = 0;
		return mod['x'];
	}

	function createExportRequire(baseId) {
		function r(id, callback) { 
			if (isList(id)) {
				var deps = [];
				each(id, function(dep) {
					deps.push(r(dep));
				});
				if (isFunction(callback))
					callback.apply(_window, deps);
			} 
			else
				return requireInternal(id, baseId, RECURSION_DEPTH); 
		};
		r['toUrl'] = function(id) { return resolvePath(id, baseId); };
		return r;
	}
	
	(_window['define'] = function(id, dependencies) { // third arg is factory, but accessed using arguments..
		var realId = isString(id) ? id : anonymousIdIndex++;
		amd['ids'].push(realId);
		modules[realId] = {
				'd': isList(id) ? id : (isList(dependencies) ? dependencies : [REQUIRE, EXPORTS, MODULE]),  // dependencies
				'f': arguments[arguments.length-1] // factory
		};
	})['amd'] = amd;
	
	_window[REQUIRE] = createExportRequire('');
})(this);


