sparkplug.js
============

<strong>WARNING! UNDER DEV, UNTESTED</strong>

Sparkplug.js is a tiny initializer for <a href="https://github.com/amdjs/amdjs-api/wiki/AMD">AMD modules</a>
in web browsers. 
After compilation with Google Closure and gzip'ing its size is only 512 bytes.

## What will sparkplug.js do for me?

sparkplug.js...
* will load all AMD modules that you include via &lt;script> tags
* allows more than one AMD module per &lt;script> (so you can compress them into a single file)
* provides you with a <code>require()</code> function to obtain references to module exports

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
  
 

