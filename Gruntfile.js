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
        },

        bump: {

            options: {

                files: [
                    'package.json'
                ],
                updateConfigs: ['pkg'],
                commit: true,
                commitMessage: 'chore(release): v%VERSION%',
                commitFiles: [
                    'package.json',
                    'CHANGELOG.md'
                ],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                pushTo: 'origin'
            }
        },

        changelog: {

            options: {
                dest: 'CHANGELOG.md'
            }
        }
    };

    grunt.registerTask('test', [

    ]);

    grunt.registerTask('build', [
        'jshint',
        'jsbeautifier',
        'test'
    ]);

    grunt.registerTask('ci-build', [
        'jshint',
        'jsbeautifier:verify',
        //'test'
        'changelog',
        'bump-commit'
    ]);

    grunt.initConfig(config);

};

