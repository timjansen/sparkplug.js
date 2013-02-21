sparkplug.js
============

Sparkplug.js is a tiny <strike>loader</strike> initializer for <a href="https://github.com/amdjs/amdjs-api/wiki/AMD">AMD modules</a>
in web browsers. 
After compilation with Google Closure and gzip'ing its size is only 512 bytes.

## What will sparkplug.js do for me?

sparkplug.js will
* load all AMD modules that you include via &lt;script> tags
* allows more than one AMD module per &lt;script> (so you can compress them into a single file)
* provide you with a <code>require()</code> function to obtain references to module exports

## How do I use sparkplug.js?

You have to
1. Load sparkplug.js with a &lt;script> tag before any AMD modules.
2. Load as many AMD modules as you like using &lt;script>
3. Then execute your JavaScript which can use <code>require()</code> to obtain references

For optimization, you can also compile sparkplug.js and AMD modules into a single file, as long as sparkplug.js is on top.

For example, you can load AMD modules like that:
> &lt;script src="sparkplug.js" />
> &lt;script src="minified.js" />
> &lt;script src="someotherlib.js" />
>
> &lt;script>
>   var $ = require("minified");
>   // do something
> &lt;/script>

You could also define your main code as AMD module and start it with a simple require.
> &lt;script src="sparkplug.js" />
> &lt;script src="minified.js" />
> &lt;script src="someotherlib.js" />
>
> &lt;script>
>   define("main", function(require) {
>       var $ = require("minified");
>       // do something
>   });
>   require("main"); // start the main module
> &lt;/script>

Of course, your application code can and usually should be put into a separate script file.


## Limitations

Sparkplug.js has some limitations:
1. All AMD modules <strong>must define an id</strong>, because sparkplug.js does work on a file basis
2. sparkplug.js will not load files given to <code>require()</code>, only modules that called <code>define()</code> with their id
3. sparkplug.js does not load/initialize asynchronously.

Sparkplug.js is best suited for smaller projects that benefit from having only one or two files. Large JavaScript applications, which I would
consider everything over 50kByte, should consider using one of the more sophisticated loaders such as curl.js or require.js.


## API

sparkplug.js provides two global functions:
* <code>define()</code> implements the full API described in the <a href="https://github.com/amdjs/amdjs-api/wiki/AMD">AMD wiki</a>, but
  note that modules must provide an ID in order for sparkplug.js to find them. <code>define()</code> will also provide the symbols
  <code>require</code>, <code>exports</code> and <code>module</code> to AMD modules, if requires by their dependencies.
* <code>require()</code> implements the CommonJS Modules/1.1.1 syntax as well as the extensions 
  <a href="https://github.com/amdjs/amdjs-api/wiki/require">required by AMD</a>. In other words, both syntax variants
  <code>require(string)</code> and <code>require(array, callback)</code> will work. <code>require(string)</code> will work fine
  in a global context, even though this is not required by AMD, and as long as you use sparkplug.js there are no disadvantages by
  using this simple variant - sparkplug.js does not load asynchronously, so callbacks are not needed.
  
 

