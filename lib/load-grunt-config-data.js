'use strict';

var util = require('util');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var yaml = require( 'js-yaml' );

function load(grunt, options, data) {

    // normalize options
    if (_.isString(options) || _.isArray(options)) {
        options = {
            src: options
        };
    }

    // normalize src to an array
    if (_.isString(options.src)) {
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
        grunt.verbose.subhead('Util "load-grunt-config-data" - loading grunt configs from ' + files.length + ' file(s).');
        if (grunt.option('debug')) {
            grunt.log.writeln(util.inspect(files));
        }
    }

    // data to return (unpoluted from options)
    var loadedData = {};

    files.forEach(function (file) {
        var extension = path.extname(file);
        var filePath = path.resolve(file);
        var fileData;

        // verbose log before loading file (helps troubleshooting bugged files)
        if (grunt.option('verbose')) {
            grunt.verbose.write('Loading ' + file + '...');
        }

        switch (extension) {
            case ".yaml":
            case ".yml":
                fileData = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'));
                break;
            case ".json":
                fileData = grunt.file.readJSON(file);
                break;
            case ".js":
                fileData = require(filePath);
                break;
            default:
                grunt.fail.warn('Util "load-grunt-config-data" - Don\'t know how to handle ".' + extension + '".');
        }

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
                var msg = '+ ' + key;
                keys = _.keys(value);
                if (keys.length) {
                    msg += ': [' + keys.join(', ') + ']';
                }
                grunt.verbose.writeln(msg);
            });
            grunt.verbose.writeln();
        }

        _.merge(loadedData, fileData);
    });

    if (grunt.option('debug')) {
        grunt.log.writeln('Util "load-grunt-config-data" - Dumping data:');
        grunt.log.writeln(util.inspect(loadedData));
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
        var loadedData = load(grunt, options, data)
        _.merge(config, loadedData);
    },
};
