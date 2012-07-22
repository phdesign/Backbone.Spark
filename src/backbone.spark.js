/*
 * Backbone.Spark v1.0
 * Copyright 2012 Paul Heasley
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Backbone.Spark is largely based off Backbone.Mutators, see the included
 * NOTICE file for details on Backbone.Mutators license detils.
 */
 
Backbone.Spark = (function (_, Backbone, undef){
    var Spark = {},
        _super = Backbone.Model.prototype;

    // Record the dependent properties so we can raise change events when the dependents change.
    // This code is largely a copy of the Ember property() code.
    Function.prototype.dependsOn = function() {
        this._dependentKeys = Array.prototype.slice.call(arguments);
        return this;
    };

    // Extend the backbone model so that we can override the constructor and provide
    // event listeners for the dependent properties.
    Spark.Model = Backbone.Model.extend({

        constructor: function Base(attributes, options) {
            var spark,
                sparkFunc;
            _super.constructor.apply(this, arguments);

            // For each spark, add an event listener for each dependent property and 
            // when the dependent is changed, raise a change event for the spark.
            for (spark in this.sparks) {
                sparkFunc = this.sparks[spark];
                if (sparkFunc._dependentKeys !== undef) {
                    for (var dependent in sparkFunc._dependentKeys) {
                        // Need a closure here so we access the *current* value of spark and sparkFunc, not the last one.
                        _.bind(function(spark, sparkFunc) {
                            this.on('change:' + sparkFunc._dependentKeys[dependent], function(model, value) {
                                this.trigger('change:' + spark, this, this.get(spark));
                            }, this);
                        }, this)(spark, sparkFunc);
                    }
                }
            }
        },

        get: function (attr) {
            var hasSparks = this.sparks !== undef;

            // If the attribute is a spark return the result of the function
            if (hasSparks === true && _.isFunction(this.sparks[attr]) === true) {
                return _.bind(this.sparks[attr], this.attributes)();
            }

            // Otherwise just delegate to the standard backbone get function.
            return _super.get.call(this, attr);
        },

        set: function (key, value, options) {
            var hasSparks = this.sparks !== undef,
                ret = null,
                attrs = null,
                attr = null,
                all = null;

            // Handle both ('key', value) and ({key: value}) style arguments.
            if (_.isObject(key) || key === null) {
                attrs = key;
                options = value;
            } else {
                attrs = {};
                attrs[key] = value;
            }
            if (!attrs) return this;

            if (hasSparks === true) {
                // For each 'set' attribute, if it's a spark then set the spark value.
                for (attr in attrs) {
                    if (_.isFunction(this.sparks[attr]) === true) {
                        // Parameters are the spark name, spark function, options and the base set function.
                        _.bind(this.sparks[attr], this)(attr, attrs[attr], options, _.bind(_super.set, this));
                        // Support setting combinations of real attributes and sparks in the same call.
                        delete attrs[attr];
                    }
                }
                // If we've processed all attributes then we're done.
                if (!attrs) return this;
            }

            // Call our base set function for any remaining attributes.
            return _super.set.call(this, attrs, options);
        },

        toJSON: function () {
            var obj = _super.toJSON.call(this);
            // Add all the sparks at the exported object.
            _.each(this.sparks, _.bind(function (property, name) {
                if (_.isFunction(this.sparks[name])) {
                    obj[name] = _.bind(this.sparks[name], this.attributes)();
                }
            }, this));

            return obj;
        }  
    });

    return Spark;

})(_, Backbone);