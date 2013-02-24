sparkplug.js
============

Sparkplug.js is a tiny initializer for <a href="https://github.com/amdjs/amdjs-api/wiki/AMD">AMD modules</a>, primarily
for use in web browsers. 
It can be used as an alternative to AMD loaders like requirejs and curl.jsm, giving you with Node-like <code>require()</code> style
dependency management and AMD modules without the overhead.
After compilation with Google Closure and gzip'ing its size is only 569 bytes.


## Why use sparkplug.js?

Use sparkplug.js if...

* you want a <code>require()</code> function that works just like in node.js
* you want AMD modules without the overhead of real AMD loaders


## What will sparkplug.js do for me?

sparkplug.js...
* will initialize all AMD modules that you include via &lt;script> tags
* allows more than one AMD module per &lt;script> (so you can compress them into a single file)
* provides you with a <code>require()</code> function to obtain references to module exports


## Size Comparison

<table>
<tr><th>Name</th><th>Compiled Size</th><th>Compiled and GZip'd</th></tr>
<tr><td>sparkplug.js</td><td>935 bytes</td><td>569 bytes</td></tr>
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
* All AMD modules <strong>should define an id</strong>, because sparkplug.js does not know file names. To include anonymous modules without
  id, see the Troublemakers section below.
* sparkplug.js will not load files given to <code>require()</code>, only modules that called <code>define()</code> with their id
* sparkplug.js does not load/initialize asynchronously.

Sparkplug.js is best suited for smaller projects that benefit from having only one or two files. Large JavaScript applications, which I would
consider everything over 50kByte, may be better off using one of the more sophisticated loaders such as curl.js or require.js.


## API

sparkplug.js provides two global functions:
* 	<code>define()</code> implements the full API described in the <a href="https://github.com/amdjs/amdjs-api/wiki/AMD">AMD wiki</a>, but
  	please note that modules must provide an ID in order for sparkplug.js to find them. 
  	
  	<code>define()</code> will also provide the symbols
  	<code>require</code>, <code>exports</code> and <code>module</code> to AMD modules, if required by their dependencies.
  	
  	<code>define.amd</code> is defined and has one sparkplug.js-specific property: <code>define.amd.ids</code>. You can put an array of ids in there to
  	assign ids to anonymous modules. See Troublemakers section below.
* 	<code>require()</code> implements the <a href="http://wiki.commonjs.org/wiki/Modules/1.1.1#Require">CommonJS Modules/1.1.1 syntax</a> as well as the extensions 
  	<a href="https://github.com/amdjs/amdjs-api/wiki/require">required by AMD</a>. 
  	
  	In other words, both syntax variants
  	<code>require(string)</code> and <code>require(array, callback)</code> will work, both locally and globally.
  	<code>require(string)</code> is not required by AMD, but as long as you use sparkplug.js there are no disadvantages by
  	using this simple variant. As sparkplug.js does not load asynchronously, callbacks are not really needed.
        If you do not plan to migrate your code to a asynchronous loader, using <code>require(string)</code> is recommended.
        
    You can also call <code>require(integer)</code> with a numeric argument to retrieve an anonymous module.
  

## Troublemakers

### Anonymous Modules

Many AMD modules do not declare their id, but instead depend on the AMD loader to determine their id from their file name. sparkplug.js
can not do this, as it does not know the file names, and also because it allows putting several modules into a single script.

The recommended way to handle such modules is to set <code>define.amd.ids</code>. It contains an array of ids for anonymous modules
in the order of their declaration. It can be set either before or after their definition, but always before the first time they are 
required (either explicitly or as dependency).

The following example loads three AMD modules. lodash.js and cookies.js are anonymous modules, while moment.js already has the id 'moment'.

	<script src="sparkplug.js"></script>
	<script src="moment.js"></script>
	<script src="cookies.js"></script>
	<script src="lodash.js"></script>
	
	<script>
		define.amd.ids = ['cookies', 'lodash'];
	
		var moment = require('moment'); 
		var cookies = require('cookies');
		var _ = require('lodash');
	</script>

Alternatively you could also require anonymous modules using their 0-based index.
The following example does this:

	<script src="sparkplug.js"></script>
	<script src="moment.js"></script>
	<script src="cookies.js"></script>
	<script src="lodash.js"></script>
	
	<script>
		var moment = require('moment'); 
		var cookies = require(0);
		var _ = require(1);
	</script>
 
In general it is better to use <code>define.amd.ids</code>, as it results in more readable code. If there are dependencies between
anonymous modules, <code>define.amd.ids</code> is also the only solution.


### jQuery

jQuery 1.9.x supports AMD, but only if the property <code>define.amd.jQuery</code> has been set before the jQuery declaration:

	<script src="sparkplug.js"></script>
	<script>define.amd.jQuery = true;</script>
	<script src="jquery.js"></script>
	
	<script>
		var jQuery = require('jquery'); 
	</script>
	
Please note that, unlike other AMD loaders, sparkplug.js does not support several jQuery versions on the same page.

 
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

	
	

		
