Backbone.Spark
==============

Provides computed property support for [Backbone.js](http://backbonejs.org/). 
Rather than providing an attribute you can provide a spark function which returns a computed value, or sets a computed value.
The interface is based on [Ember's](http://emberjs.com/) computed properties, most of the implementation is based on [Backbone.Mutators](https://github.com/asciidisco/Backbone.Mutators). 

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

Installation
------------

Add 
```html
<script src="js/libs/backbone.spark.js"></script>
```
After your Backbone include for the page.

Dependencies
------------

Requires [Backbone.js](http://backbonejs.org/) and [Underscore.js](http://underscorejs.org/).

Version History
---------------

### v1.0
* Initial release
