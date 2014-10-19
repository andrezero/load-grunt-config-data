'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function load(grunt, options, data) {

    // normalize options
    if (_.isString(options) || _.isArray(options)) {
        options = {
            src: options
        };
    }

    // normalize src to an array
    if (_.isString(options.src))
        options.src = [options.src];
    }

    // default options, if any in the furute
    // options = _.defaults(options, {});

    // expand list of files
    var files = grunt.file.expand(options.src);

    // clone data
    if (data) {
        data = _.clone(data);
    }

    // verbose header (helps locating source of verbose messages)
    if (grunt.option('verbose') || grunt.option('debug')) {
        grunt.verbose.subhead('Loading grunt configs via "load-grunt-config-data" from ' + files.length + ' file(s).');
        if (grunt.option('debug')) {
            grunt.log.writeln(util.inspect(files));
        }
    }

    // data to return (unpoluted from options)
    var loadedData = {};

    files.forEach(function (file) {
        var fileData;

        // verbose log before loading file (helps troubleshooting bugged files)
        if (grunt.option('verbose')) {
            grunt.verbose.write('Loading ' + filepath + '...');
        }

        fileData = require(file);

        if (_.isFunction(fileData)) {
            // verbose log before invoking fn() (helps troubleshooting bugged files)
            if (grunt.option('verbose')) {
                grunt.verbose.write('is fn(), invoking...');
            }
            fileData = fileData(grunt, data);
        }

        // verbose log of tasks loaded from file
        if (grunt.option('verbose')) {
            var keys;
            grunt.verbose.ok();
            _.each(fileData, function (value, key) {
                grunt.verbose.write('+ ' + key);
                keys = _.keys(value);
                if (keys.length) {
                    grunt.verbose.writeln(': [' + keys.join(', ') + ']');
                }
            });
            grunt.verbose.writeln();
        }

        _.merge(loadedData, fileData);
    });

    if (grunt.option('debug')) {
        grunt.log.writeln('Dumping data loaded via "load-grunt-config-data":');
        grunt.log.writeln(util.inspect(data));
    }

    return loadedData;
};

module.exports = {

    /**
     * @param {object}  grunt        Grunt instance.
     * @param {string}  files        One or more paths/files, may contain `glob` patterns, including `!negatives`.
     * @param {object=} dataOptional data you want to pass into functions exported by loaded files.

     */
    load: function (grunt, options, data) {
        return load(grunt, options, data)
    },
    merge: function (grunt, options, config, data) {
        var loadedData = merge(grunt, options, data)
        _.merge(config, loadedData);
    },
};
