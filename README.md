sparkplug.js
============

Sparkplug.js is a tiny initializer for <a href="https://github.com/amdjs/amdjs-api/wiki/AMD">AMD modules</a>, primarily
for use in web browsers. 
It can be used as an alternative to AMD loaders like requirejs and curl.jsm, giving you namespaces and AMD module structure 
with a Node-like <code>require()</code> style dependency management, but without the overhead of a full AMD loader.
After compilation with Google Closure and gzip'ing its size is only 597 bytes.


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
<tr><td>sparkplug.js</td><td>1041 bytes</td><td>597 bytes</td></tr>
<tr><td>requirejs 2.1.4</td><td>14629 bytes</td><td>6029 bytes</td></tr>
<tr><td>curl 0.7.3</td><td>7967 bytes</td><td>3921 bytes</td></tr>
</table>

## How do I use sparkplug.js?

You have to
* Load sparkplug.js with a &lt;script> tag before any AMD modules.
* Load as many AMD modules as you like using &lt;script>
* Then execute your JavaScript which can use <code>require()</code> to obtain references

For optimal performance, you can also compile sparkplug.js and the AMD modules into a single file, just make sure that sparkplug.js is on top.

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


## Reducing Page Load Time

As sparkplug.js does not load any files itself, all the usual tips for improving load time apply. Ideally you compile all your files
into a single file as this will reduce the number of HTTP requests and improve the GZip compression rate.

To prevent the browser from blocking while it processes JavaScript you should either work with the <code>defer</code> and
<code>async</code> attributes of the <code>&lt;script></code> element, or use the old-fashioned trick of putting all your JavaScript
at the end of the page.

Assuming you have put all your JavaScript, including sparkplug.js and all AMD modules, into a single file, I would recommend to load it
like this:

	<script src="all.js" defer async></script>
	
The <code>defer</code> and <code>async</code> attributes will prevent the browser from blocking. This works in practically all browsers today,
even in older Internet Explorers.

If you can not or do not want to put all your files into a single file, you should use only the <code>defer</code> attribute. <code>async</code>
is not possible then, because it does not guarantee the order in which the files are initialized and sparkplug.js must always be invoked
before the AMD modules.



## Limitations

Sparkplug.js has some limitations:
* All AMD modules <strong>should define an id</strong>, because sparkplug.js does not know file names. To include anonymous modules without
  id, see the Troublemakers section below.
* sparkplug.js will not load files given to <code>require()</code>, only modules that called <code>define()</code> with their id
* sparkplug.js does not load/initialize asynchronously.

Sparkplug.js is best suited for smaller projects that benefit from having only one or two files. Large JavaScript applications, especially
those with an overall size over 50kb, may be better off using one of the more sophisticated loaders such as curl.js or require.js.


## API

sparkplug.js provides three global functions:
* 	<code>define()</code> implements the full API described in the <a href="https://github.com/amdjs/amdjs-api/wiki/AMD">AMD wiki</a>.  
  	
  	<code>define()</code> will also provide the symbols
  	<code>require</code>, <code>exports</code> and <code>module</code> to AMD modules, if required by their dependencies.
  	
  	<code>define.amd</code> is defined with the properties shown below.
  	
* 	<code>require()</code> implements the <a href="http://wiki.commonjs.org/wiki/Modules/1.1.1#Require">CommonJS Modules/1.1.1 syntax</a> as well as the extensions 
  	<a href="https://github.com/amdjs/amdjs-api/wiki/require">required by AMD</a>. 
  	
  	In other words, both syntax variants
  	<code>require(string)</code> and <code>require(array, callback)</code> will work, both locally and globally.
  	<code>require(string)</code> is not required by AMD, but as long as you use sparkplug.js there are no disadvantages by
  	using this simple variant. As sparkplug.js does not load asynchronously, callbacks are not really needed.
        If you do not plan to migrate your code to a asynchronous loader, using <code>require(string)</code> is recommended.
        
    You can also call <code>require(integer)</code> with a numeric argument to retrieve an anonymous module.
  
* 	<code>require.toUrl()</code> is an <a href="https://github.com/amdjs/amdjs-api/wiki/require">AMD extension</a> that usually is not
	very useful when you use sparkplug.js, because sparkplug does not handle URLs. Still, <code>require.toUrl()</code> will resolve paths
	relative to the module's path.
 
  
The AMD extension <code>define.amd</code> has the following, proprietary extensions in sparkplug.js:
*	<code>define.amd.anonIds</code> can be used to assign ids to anonymous modules. You only have to put one desired ids per module
    in the order of definition. See Troublemakers section for examples.

*	<code>define.amd.ids</code> is an array containing the ids of all defined modules in the order of their definition.
    Anonymous modules will show up as 0-based, increasing numbers, even if you have defined an id for them using <code>anonIds</code>. The first
    anonymous module will be 0, the second 1...
    
  

## Troublemakers

### Anonymous Modules

Many AMD modules do not declare their id, but instead depend on the AMD loader to determine their id from their file name. sparkplug.js
can not do this, as it does not know the file names, and also because it allows putting several modules into a single script.

The recommended way to handle such modules is to set <code>define.amd.anonIds</code>. It contains an array of ids for anonymous modules
in the order of their declaration. It can be set either before or after their definition, but always before the first time they are 
required (either explicitly or as dependency).

The following example loads three AMD modules. lodash.js and cookies.js are anonymous modules, while moment.js already has the id 'moment'.

	<script src="sparkplug.js"></script>
	<script src="moment.js"></script>
	<script src="cookies.js"></script>
	<script src="lodash.js"></script>
	
	<script>
		define.amd.anonIds = ['cookies', 'lodash'];
	
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
 
In general it is better to use <code>define.amd.anonIds</code>, as it results in more readable code. If there are dependencies between
anonymous modules, <code>define.amd.anonIds</code> is also the only solution.


### Finding Module Ids

Many libraries can be loaded as AMD modules, but often it's hard to find their id in the documentation, or the documentation does 
not really tell you whether the library is anonymous or not. For these cases, sparkplug.js provides you with an 
array <code>define.amd.ids</code> that allows you to see the ids of all loaded modules in the order of their definition. 
Anonymous modules are represented by their 0-based index, which you can use to write a <code>define.amd.anonIds</code> mapping 
table, or to require them by index.

The easiest way to find out ids is to temporarily add a <code>console.log()</code> to your application, run it and see the 
ids on the log:

	<script src="sparkplug.js"></script>
	<script src="moment.js"></script>
	<script src="cookies.js"></script>
	<script src="lodash.js"></script>

	<script>
		console.log(define.amd.ids);
	</script>


This example writes this to the log:

	['moment', 0, 1]

Thus 'moment.js' uses the id 'moment', and the other two modules are anonymous.



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

	
	

		
