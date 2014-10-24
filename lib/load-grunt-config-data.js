'use strict';

var util = require('util');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');

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
        grunt.verbose.subhead('Util load-grunt-config-data: loading configuration from ' + files.length + ' file(s).');
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

        try {
            switch (extension) {
            case '.yaml':
            case '.yml':
                fileData = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'));
                break;
            case '.json':
                fileData = grunt.file.readJSON(file);
                break;
            case '.js':
                fileData = require(filePath);
                break;
            default:
                grunt.fail.warn('Util load-grunt-config-data: unhandled file extension ".' + extension + '".');
            }
        }
        catch (e) {
            e.message = 'Util load-grunt-config-data: fail loading file "' + file + '" with error: "' + e.message + '".';
            grunt.fail.warn(e.message);
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
                var list = _.keys(value);
                grunt.verbose.writeln('+ ' + key.cyan + (list.length ? (': [' + list.join(', ')) + ']' : ''));
            });
            //grunt.verbose.writeln();
        }

        _.merge(loadedData, fileData);
    });

    if (grunt.option('debug')) {
        grunt.log.writeln('Util load-grunt-config-data: dumping data:');
        grunt.log.writeln(util.inspect(loadedData));
    }

    return loadedData;
}


/**
 * Utility to load Grunt config files.
 *
 * @param {object} grunt   Grunt instance.
 *
 * @returns {object} module api
 */
module.exports = function (grunt) {

    var api = {
        /**
         * Loads all files that match file|files files, merges everything and returns the result. A deep clone of the
         * optional data argument is passed as a second argument to functions exported by loaded files.
         *
         * @param  {string|array} files  One or more paths/files, may contain glob patterns, including !negatives.
         * @param  {object}       data   Optional data you want to pass into functions exported by loaded files.
         *
         * @returns {object} Loaded data
         */
        load: function (files, data) {
            return load(grunt, files, data);
        },

        /**
         * Loads all files that match file|files, merges everything into the config argument. A deep clone of the
         * optional data argument is passed as a second argument to functions exported by loaded files.
         *
         * @param  {object}       grunt  Grunt instance.
         * @param  {string|array} files  One or more paths/files, may contain glob patterns, including !negatives.
         * @param  {object}       config Loaded data is merged into this object.
         * @param  {object}       data   Optional data you want to pass into functions exported by loaded files.
         */
        merge: function (files, config, data) {
            var loadedData = load(grunt, files, data);
            _.merge(config, loadedData);
        }
    };

    return api;
};

