'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var config = {

        pkg: require('./package.json'),

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

        prerelease: {

            commitMessage: 'chore: pre-release (bump + changelog)'
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
                push: true,
                pushTo: 'origin'
            }
        },

        changelog: {

            options: {
                dest: 'CHANGELOG.md',
                template: 'changelog.tpl'
            }
        }
    };

    grunt.initConfig(config);

    grunt.registerTask('test', [

    ]);

    grunt.registerTask('build', [
        'jshint',
        'jsbeautifier',
        'test'
    ]);

    grunt.registerTask('release', [
        'git-is-clean',
        'bump-only:prerelease',
        'changelog',
        'bump-commit'
    ]);

    grunt.registerTask('ci-build', ['build']);

    grunt.registerTask('ci-release', [
        'git-is-clean',
        'jshint',
        'jsbeautifier:verify',
        'test',
        'bump'
    ]);

};

