'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var config = {

        jshint: {

            options: {
                jshintrc: '.jshintrc'
            },

            all: [
                'Gruntfile.js',
                'lib/*.js'
            ]
        },

        jsbeautifier: {

            options: {
                config: '.jsbeautifyrc'
            },

            modify: {
                src: [
                    'Gruntfile.js',
                    'lib/*.js'
                ]
            },

            verify: {
                src: [
                    'Gruntfile.js',
                    'lib/*.js'
                ],
                options: {
                    mode: 'VERIFY_ONLY'
                }
            }
        }
    };

    // Default task.
    grunt.registerTask('default', ['jshint', 'jsbeautifier']);

    //
    grunt.initConfig(config);

};

