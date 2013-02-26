// tests for sparkplug.js
//
// Instructions:
// - requires node.js installation
// - install mocha (npm mocha -g)
// - run (mocha test)
//

var vm = require("vm");
var fs = require("fs");
var assert = require("assert");

// sparkplug usually adds its functions to the global context. loadInContext() function loads it with local context.
function loadInContextSrc(src) {
	var ctx = {};
	var src = fs.readFileSync(src);
	vm.runInNewContext(src, ctx);
	return ctx;
}

function runTests(loadInContext) {
	describe('#define()', function() {
		it('should work without factory', function() {
			var sparkplug = loadInContext();
			sparkplug.define('t1', 'teeest');
			assert.equal(sparkplug.require('t1'),  'teeest');
		});

		it('should call the factory once', function() {
			var sparkplug = loadInContext();
			var called = 0;
			sparkplug.define('t2', function() { called++; return "tx2";});
			assert.equal(sparkplug.require('t2'),  'tx2');
			assert.equal(sparkplug.require('t2'),  'tx2');
			assert.equal(sparkplug.require('t2'),  'tx2');
			assert.equal(called, 1);
		});

		it('should provide require', function() {
			var called = 0;
			var sp = loadInContext();
			sp.define('t1', 'teeest');
			sp.define('t3', function(require) { assert.equal(require('t1'), 'teeest'); called++; return "tx3";});
			assert.equal(sp.require('t3'),  'tx3');
			assert.equal(called, 1);
		});

		it('should provide exports', function() {
			var sparkplug = loadInContext();
			var called = 0;
			sparkplug.define('t4', function(require, exports) { called++; exports.val1 = 'gf2'; exports.val2 = 123; return 0;});
			assert(sparkplug.require('t4') != null);
			assert.equal(sparkplug.require('t4').val1, 'gf2');
			assert.equal(sparkplug.require('t4').val2, 123);
			assert.equal(called, 1);
		});

		it('should ignore exports if factory returned true value', function() {
			var sparkplug = loadInContext();
			var called = 0;
			sparkplug.define('t5', function(require, exports) { called++; exports.val1 = 'gf2'; exports.val2 = 123; return 456;});
			assert.equal(sparkplug.require('t5'),  456);
			assert.equal(called, 1);
		});
		
		it('should provide module', function() {
			var sparkplug = loadInContext();
			var called = 0;
			sparkplug.define('t6', function(require, exports, module) { called++; assert.equal(module.id, 't6'); });
			assert(sparkplug.require('t6') != null);
			assert(sparkplug.require('t6') != null);
			assert.equal(called, 1);
		});
		
		it('should provide module.exports', function() {
			var sparkplug = loadInContext();
			var called = 0;
			sparkplug.define('t7', function(require, exports, module) { called++; module.exports.val1 = 'gf5'; module.exports.val2 = 123; return 0;});
			assert(sparkplug.require('t7') != null);
			assert.equal(sparkplug.require('t7').val1, 'gf5');
			assert.equal(sparkplug.require('t7').val2, 123);
			assert.equal(called, 1);
		});

		it('should allow module.exports overrides', function() {
			var sparkplug = loadInContext();
			var called = 0;
			sparkplug.define('t8', function(require, exports, module) { called++; exports.val1 = 'gf5'; module.exports.val2 = 123;  module.exports = 654; return 0;});
			assert.equal(sparkplug.require('t8'), 654);
			assert.equal(called, 1);
		});

		it('should allow require, exports, module as dependencies', function() {
			var sp = loadInContext();
			sp.define('t1', 'teeest');
			sp.define('t9', ['module', 'require', 'exports'], function(module, require, exports) { assert.equal(require('t1'), 'teeest'); assert.equal(module.id, 't9'); exports.val1 = 'gxx'; });
			assert.equal(sp.require('t9').val1, 'gxx');
		});
		
		it('should assign numbers to anonymous modules', function() {
			var sparkplug = loadInContext();
			sparkplug.define(function() { return 1; });
			sparkplug.define(2);
			sparkplug.define(function() { return 3; });

			assert.equal(sparkplug.require(0), 1);
			assert.equal(sparkplug.require(1), 2);
			assert.equal(sparkplug.require(2), 3);
		});

		it('should use require.amd.anonIds by as default ids', function() {
			var sparkplug = loadInContext();
			sparkplug.define(function() { return 1; });
			sparkplug.define(2);
			sparkplug.define(function() { return 3; });

			sparkplug.define.amd.anonIds = ['t1', 't2', 't3'];
			assert.equal(sparkplug.require('t1'), 1);
			assert.equal(sparkplug.require('t2'), 2);
			assert.equal(sparkplug.require('t3'), 3);
		});
		
		it('should use resolve dependencies using define.amd.anonIds', function() {
			var sparkplug = loadInContext();
			sparkplug.define(function() { return 1; });
			sparkplug.define(['t1'], 2);
			sparkplug.define(['t1', 't2'], function(t1, t2) { assert.equal(t1, 1);  assert.equal(t2, 2); return 3; });

			sparkplug.define.amd.anonIds = ['t1', 't2', 't3'];
			assert.equal(sparkplug.require('t3'), 3);
			assert.equal(sparkplug.require('t1'), 1);
			assert.equal(sparkplug.require('t2'), 2);
		});
		
		it('should put module names in define.amd.ids', function() {
			var sp = loadInContext();
			assert.equal(sp.define.amd.ids, 0);
			sp.define(function() { return 1; });
			assert.equal(sp.define.amd.ids.length, 1);
			assert.equal(sp.define.amd.ids[0], 0);
			sp.define('t1', 2);
			assert.equal(sp.define.amd.ids.length, 2);
			assert.equal(sp.define.amd.ids[0], 0);
			assert.equal(sp.define.amd.ids[1], 't1');
			sp.define('t2',  5);
			assert.equal(sp.define.amd.ids.length, 3);
			assert.equal(sp.define.amd.ids[0], 0);
			assert.equal(sp.define.amd.ids[1], 't1');
			assert.equal(sp.define.amd.ids[2], 't2');

			sp.define.amd.anonIds = ['t0'];
			assert.equal(sp.require('t0'), 1);
			assert.equal(sp.require('t1'), 2);
			assert.equal(sp.define.amd.ids.length, 3);
			assert.equal(sp.define.amd.ids[0], 0);
			assert.equal(sp.define.amd.ids[1], 't1');
			assert.equal(sp.define.amd.ids[2], 't2');
		});
		
		it('should allow specifying dependencies', function() {
			var sp = loadInContext();

			sp.define('dep1', function() { return 14; });
			sp.define('dep3', ['exports'], function(exports) { exports.x = 14; });
			sp.define('t1', ['dep1', 'module', 'dep2', 'require', 'exports', 'dep3'], function(dep1, module, dep2, require, exports, dep3) {
				assert.equal(require('dep1'), 14); 
				assert.equal(module.id, 't1'); 
				assert.equal(require('dep2'), "e29");
				exports.val1 = 'gxx';
				assert.equal(require('dep3').x, 14);
			});
			sp.define('dep2', "e29"); // declared intentionally after t1!

			assert.equal(sp.require('t1').val1, 'gxx');
		});
		
		it('should throw errors on declared circular deps', function() {
			var sp = loadInContext();
			var called = 0;
			sp.define('t1', ['t2'], function() {called++;});
			sp.define('t2', ['t1'], function() {called++;});
			
			assert.throws(function() {
				sp.require('t1');		
			});
			assert.throws(function() {
				sp.require('t2');
			});
			assert.equal(called, 0);
		});
		
		it('should throw errors on coded circular deps', function() {
			var sp = loadInContext();
			sp.define('t1', function(require) { require('t2'); });
			sp.define('t2', function(require) { require('t1'); });
			
			assert.throws(function() {
				sp.require('t1');		
			});
			assert.throws(function() {
				sp.require('t2');
			});
		});

		it('should throw errors on mixed circular deps', function() {
			var sp = loadInContext();
			var called = 0;
			sp.define('t1', function(require) { require('t2'); });
			sp.define('t2', ['t1'], function(require) { called++; });
			
			assert.throws(function() {
				sp.require('t1');		
			});
			assert.throws(function() {
				sp.require('t2');
			});
			assert.equal(called, 0);
		});

	});

	
	
	
	describe('#require()', function() {
		it('should provide a global require', function() {
			var sp = loadInContext();
			sp.define('t1', 'teeest');
			assert.equal(sp.require('t1'), 'teeest'); 
			sp.define('t2', 19);
			assert.equal(sp.require('t1'), 'teeest'); 
			assert.equal(sp.require('t2'), 19); 
		});

		it('should allow async', function() {
			var sp = loadInContext();
			var called = 0;
			sp.define('t1', 'teeest');
			sp.define('t2', 19);
			sp.require(['t1', 't2'], function(t1, t2) {
				called++;
				assert.equal(t1, 'teeest'); 
				assert.equal(t2, 19); 
			});
			assert.equal(called, 1);
		});

		it('should allow async without callback', function() {
			var sp = loadInContext();
			var called = 0;
			sp.define('t1', function() {called++;});
			sp.define('t2', function() {called++;});
			sp.require(['t1', 't2']);
			assert.equal(called, 2);
		});
		
		it('should allow async require in defines', function() {
			var sp = loadInContext();
			var called = 0;
			sp.define('t1', 'teeest');
			sp.define('t2', 19);
			sp.define('t3', function(require) { 
				require(['t1', 't2'], function(t1, t2) {
					called++;
					assert.equal(t1, 'teeest'); 
					assert.equal(t2, 19); 
				})
				return 'x';
			});
			assert.equal(sp.require('t3'), 'x');
			assert.equal(called, 1);
		});
		
		it('should throw errors for unknown ids', function() {
			var sp = loadInContext();
			assert.throws(function() {
				sp.require('t1');		
			});
		});
		
		it('should allow declared relative dependencies', function() {
			var sp = loadInContext();
			var called = 0;
			sp.define('a/b/c/d', 56);
			sp.define('a/b/c/d2', 69);
			sp.define('a/b/c', 5);
			sp.define('a/b/c2', 15);
			sp.define('a/b2', 19);
			sp.define('a/b3', 69);
			
			sp.define('a/b/c3', ['./c', './c2', '../b2', '../../a/b3', './c/d', '../b/c/d2'], 
					function(c, c2, b2, b3, d, d2) {
						assert.equal(c, 5);
						assert.equal(c2, 15);
						assert.equal(b2, 19);
						assert.equal(b3, 69);
						assert.equal(d, 56);
						assert.equal(d2, 69);
						called++;
			});
			sp.require('a/b/c3');
			assert.equal(called, 1);
		});

		it('should allow relative dependencies using require()', function() {
			var sp = loadInContext();
			var called = 0;
			sp.define('a/b/c/d', 56);
			sp.define('a/b/c/d2', 69);
			sp.define('a/b/c', 5);
			sp.define('a/b/c2', 15);
			sp.define('a/b2', 19);
			sp.define('a/b3', 69);
			
			sp.define('a/b/c3', function(require) {
				assert.equal(require('./c'), 5);
				assert.equal(require('./././c2'), 15);
				assert.equal(require('../b2'), 19);
				assert.equal(require('../../a/b3'), 69);
				assert.equal(require('./c/d'), 56);
				assert.equal(require('../b/../b/c/./d2'), 69);
				called++;
			});
			sp.require('a/b/c3');
			assert.equal(called, 1);
		});
	});
	
	
	
	
	describe('#request.toUrl()', function() {
		it('should not resolve relative dependencies at global level', function() {
			var sp = loadInContext();
			var called = 0;
			sp.define('a/b/c/d', 56);
			sp.define('a/b/c/d2', 69);
			assert.equal(sp.require.toUrl('./a/b'), 'a/b');
			assert.equal(sp.require.toUrl('../a/b'), 'a/b');
		});
		
		it('should resolve relative dependencies at module level', function() {
			var sp = loadInContext();
			var called = 0;
			sp.define('a/b/c/d', 56);
			sp.define('a/b/c/d2', 69);
			sp.define('a/b/c', 5);
			sp.define('a/b/c2', 15);
			sp.define('a/b2', 19);
			sp.define('a/b3', 69);
			
			sp.define('a/b/c3', function(require) {
				assert.equal(require.toUrl('./c.js'), 'a/b/c.js');
				assert.equal(require.toUrl('./././c2'), 'a/b/c2');
				assert.equal(require.toUrl('../b2'), 'a/b2');
				assert.equal(require.toUrl('../../a/b3'), 'a/b3');
				assert.equal(require.toUrl('./c/d'), 'a/b/c/d');
				assert.equal(require.toUrl('../b/../b/c/./d2'), 'a/b/c/d2');
				assert.equal(require.toUrl('../z/z/./x.js'), 'a/z/z/x.js');
				called++;
			});
			sp.require('a/b/c3');
			assert.equal(called, 1);
		});



	});
}

describe('sparkplug.js', function() {
	runTests(function() { return loadInContextSrc('../sparkplug.js'); });
});
describe('sparkplug.min.js', function() {
	runTests(function() { return loadInContextSrc('../sparkplug.min.js'); });
});



