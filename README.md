sparkplug.js
============

Sparkplug.js is a tiny initializer for <a href="https://github.com/amdjs/amdjs-api/wiki/AMD">AMD modules</a>, primarily
for use in web browsers. 
It can be used as an alternative to AMD loaders like requirejs and curl.js if you want nodelike <code>require()</code> style
dependency management and AMD modules without the overhead.
After compilation with Google Closure and gzip'ing its size is only 532 bytes.


## Why use sparkplug.js?

Use sparkplug.js if...

* you want a <code>require()</code> function that works just like in node.js
* you want AMD modules without the overhead of true AMD loaders


## What will sparkplug.js do for me?

sparkplug.js...
* will initialize all AMD modules that you include via &lt;script> tags
* allows more than one AMD module per &lt;script> (so you can compress them into a single file)
* provides you with a <code>require()</code> function to obtain references to module exports


## Size Comparison

<table>
<tr><th>Name</th><th>Compiled Size</th><th>Compiled and GZip'd</th></tr>
<tr><td>sparkplug.js</td><td>871 bytes</td><td>532 bytes</td></tr>
<tr><td>requirejs 2.1.4</td><td>14629 bytes</td><td>6029 bytes</td></tr>
<tr><td>curl 0.7.3</td><td>7967 bytes</td><td>3921 bytes</td></tr>
</table>

## How do I use sparkplug.js?

You have to
* Load sparkplug.js with a &lt;script> tag before any AMD modules.
* Load as many AMD modules as you like using &lt;script>
* Then execute your JavaScript which can use <code>require()</code> to obtain references

For optimization, you can also compile sparkplug.js and the AMD modules into a single file, as long as sparkplug.js is on top.

For example, you can load AMD modules like that:
	
	<script src="sparkplug.js"></script>
	<script src="minified.js"></script>
	<script src="someotherlib.js"></script>
	
	<script>
		var $ = require("minified");
		// do something
	</script>

You could also define your main code as AMD module and start it with a simple require.
	
	<script src="sparkplug.js"></script>
	<script src="minified.js"></script>
	<script src="someotherlib.js"></script>
	
	<script>
		define("main", function(require) {
			var $ = require("minified");
			// do something
		});
		require("main"); // start the main module
	</script>

Of course, your application code can and usually should be put into a separate script file.


## Limitations

Sparkplug.js has some limitations:
* All AMD modules <strong>must define an id</strong>, because sparkplug.js does work on a file basis
* sparkplug.js will not load files given to <code>require()</code>, only modules that called <code>define()</code> with their id
* sparkplug.js does not load/initialize asynchronously.

Sparkplug.js is best suited for smaller projects that benefit from having only one or two files. Large JavaScript applications, which I would
consider everything over 50kByte, should consider using one of the more sophisticated loaders such as curl.js or require.js.


## API

sparkplug.js provides two global functions:
* 	<code>define()</code> implements the full API described in the <a href="https://github.com/amdjs/amdjs-api/wiki/AMD">AMD wiki</a>, but
  	note that modules must provide an ID in order for sparkplug.js to find them. 
  	
  	<code>define()</code> will also provide the symbols
  	<code>require</code>, <code>exports</code> and <code>module</code> to AMD modules, if required by their dependencies.
* 	<code>require()</code> implements the CommonJS Modules/1.1.1 syntax as well as the extensions 
  	<a href="https://github.com/amdjs/amdjs-api/wiki/require">required by AMD</a>. 
  	
  	In other words, both syntax variants
  	<code>require(string)</code> and <code>require(array, callback)</code> will work, both locally and globally.
  	<code>require(string)</code> is not required by AMD, and as long as you use sparkplug.js there are no disadvantages by
  	using this simple variant. As sparkplug.js does not load asynchronously, callbacks are not needed. 
  
## Example

### Calculator Package

	// Using simplified module definition (without factory function, no dependencies)
	define('mathops', {
		add: function(a, b) { return a+b; },
		sub: function(a, b) { return a-b; },
		mul: function(a, b) { return a*b; },
		div: function(a, b) { return a+b; }
	});
	
	// Providing a module factory, with static dependency to 'mathops'.
	define('calculator', ['mathops'], function(mathops) {
		return { 
			square: function(a) {
				return mathops.mul(a, a);
			},
			calc: function(op, a, b) {
				return mathops[op](a, b);
			}
		};
	});


	// Usage in global context
	var calculator = require('calculator');  
	var answer  = calculator.calc('mul', 6, 7);     // 42
	var answer2 = calculator.square(8);             // 64


### Alternative Implementation of Calculator

	// Alternative way to implement mathops. With factory function, but using exports.
	define('mathops2', function(require, exports, module) {
		exports.add = function(a, b) { return a+b; };
		exports.sub = function(a, b) { return a-b; };
		exports.mul = function(a, b) { return a*b; };
		exports.div = function(a, b) { return a+b; };
	});

	// Implements only 'calculator's calc function; exports it directly; obtains 'mathops2' using require().
	define('calculator2', function(require) {
		return function(op, a, b) {
			var mathops = require('mathops2');
			return mathops[op](a, b);
		};
	});

	// Usage in global context
	var calculator = require('calculator2');
	var answer  = calculator('mul', 6, 7);     // 42

	
	

		