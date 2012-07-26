Backbone.Spark
==============

Provides computed property support for [Backbone.js](http://backbonejs.org/). 
Rather than providing an attribute you can provide a spark function which returns a computed value, or sets a computed value. 
Computed values are cached for fast retrieval, caching can be disabled.
The interface is based on [Ember's](http://emberjs.com/) computed properties, most of the implementation is based on [Backbone.Mutators](https://github.com/asciidisco/Backbone.Mutators). 

Installation
------------

Add a reference to the Backbone.Spark library, e.g. 
```html
<script src="js/libs/backbone.spark.js"></script>
```
After your Backbone include.

Dependencies
------------

Requires [Backbone.js](http://backbonejs.org/) and [Underscore.js](http://underscorejs.org/).
Works with Backbone.js 0.9.2 and Underscore.js 1.3.1.

Usage
-----

Backbone.Spark defines a new Model class that you can choose to inherit from.

### Basic Usage
To use, declare a new property object called sparks and add function properties for the
'getter' accessors. 
Call dependsOn with the spark to specify which attributes this spark depends on. Whenever
the dependent attribute(s) are changed, a change event will also be triggered for this spark.

```javascript
App.File = Backbone.Spark.Model.extend({

    defaults: function() {
      return {
        content: null,
        filePath: null
      };
    },

    sparks: {

        extn: function() {
            var i = this.filePath.lastIndexOf('.');
            return i >= 0 ? this.filePath.substr(i) : '';
        }.dependsOn('filePath')

    }

});
```

### Using Setters
When calling set on a spark, the set function arguments are passed to the spark function.
You can identify a getter call by testing arguments.length === 0, a setter call has the following arguments:  
**key:** The name of the spark property.  
**value:** The new value to be set.  
**options:** Any options passed to the set call, including whether this call should raise events or not (silent).  
**set:** The base class set function.  

```javascript
App.File = Backbone.Spark.Model.extend({

    defaults: function() {
      return {
        content: null,
        filePath: null
      };
    },

    sparks: {

        extn: function(key, value, options, set) {
            if (arguments.length === 0) {
                var i = this.filePath.lastIndexOf('.');
                return i >= 0 ? this.filePath.substr(i) : '';
            } else {
                var filePath = this.get('filePath'),
                    i = filePath.lastIndexOf('.');

                if (i >= 0)
                    this.set('filePath', filePath.substr(0, i) + value);
            }
        }.dependsOn('filePath')

    }

});
```

Examples
--------

The following example is available in the /demo folder.

```html
<!doctype html>
<html>
<head>
    <title>Backbone.Spark Demo</title>  
    <script src="js/libs/json2.js"></script>
    <script src="js/libs/underscore-1.3.1.js"></script>
    <script src="js/libs/backbone.js"></script>
    <script src="../src/backbone.spark.js"></script>
    <script type="text/javascript">

var Demo = Backbone.Spark.Model.extend({

    defaults: function() {
      return {
        filePath: null
      };
    },

    sparks: {

        extn: function(key, value, options, set) {
            if (arguments.length === 0) {
                var i = this.filePath.lastIndexOf('.');
                return i >= 0 ? this.filePath.substr(i) : '';
            } else {
                var filePath = this.get('filePath'),
                    i = filePath.lastIndexOf('.');

                if (i >= 0)
                    this.set('filePath', filePath.substr(0, i) + value);
            }
        }.dependsOn('filePath'),

        folderPath: function() {
            if (!this.filePath) return '';
            var i = this.filePath.lastIndexOf('/');
            return i >= 0 ? this.filePath.substring(0, i) : ''; 
        }.dependsOn('filePath'),

    }

});

window.onload = function() {
    var content = document.getElementById('content'),
        demo = new Demo();

    function writeLine(msg) {
        content.innerHTML = content.innerHTML + msg + '<br/>';
    }

    demo.on('change', function() { 
        writeLine('Something changed<br/>'); 
    });
    demo.on('change:filePath', function(m, v) { 
        writeLine('filePath changed to ' + v ); 
    });
    demo.on('change:extn', function(m, v) { 
        writeLine('extn changed to ' + v); 
    });
    demo.on('change:folderPath', function(m, v) { 
        writeLine('folderPath changed to ' + v); 
    });

    writeLine('Setting filePath to \'/projects/test.html\'');
    demo.set('filePath', '/projects/test.html');

    writeLine('');
    writeLine('Getting folderPath value: ' + demo.get('folderPath'));

    writeLine('');
    writeLine('Setting extn to \'.js\'');
    demo.set('extn', '.js');

    writeLine('');
    writeLine('Getting extn value: ' + demo.get('extn'));

    writeLine('');
    writeLine('toJSON result: ')
    writeLine('<pre>' + JSON.stringify(demo.toJSON()) + '<pre>');
}

    </script>
</head>
<body>
    <div id="content"></div>
</body>
</html>
```

Which results in:

```text
Setting filePath to '/projects/test.html'
extn changed to .html
folderPath changed to /projects
filePath changed to /projects/test.html
Something changed


Getting folderPath value: /projects

Setting extn to '.js'
extn changed to .js
folderPath changed to /projects
filePath changed to /projects/test.js
Something changed


Getting extn value: .js

toJSON result: 
{"filePath":"/projects/test.js","extn":".js","folderPath":"/projects"}
```

Caching
-------

Whenever a spark value is retrieved or set, it is cached for faster future retrieval.
When a dependent attributes changes the cache is cleared to allow re-computation of the value.
To disable caching for a spark, call .noCache(), e.g. 

```javascript
folderPath: function() {

    if (!this.filePath) return '';
    var i = this.filePath.lastIndexOf('/');
    return i >= 0 ? this.filePath.substring(0, i) : ''; 

}.dependsOn('filePath').noCache()
```

Version History
---------------

### v1.1
* Made context of getter and setter functions consistent
* Only raise one spark change per change event
* Implement automatic caching

### v1.0
* Initial release
