#!/usr/bin/env node
var sh = require('execSync');
var util = require('util');
var colors = require('colors');
var _ = require('underscore');

function execCommand(command) {
    console.log(util.format('CI: Executing "%s"\n', command).bold);
    var exec = sh.exec(command);
    console.log(exec.stdout);
    if (exec.code) {
        throw new Error(exec.code);
    } else {
        console.log(util.format('CI: "%s": OK.\n', command).green.bold);
    }
}


function run() {
    if (!process.env.TRAVIS) {
        console.warn('CI: WARNING: Not on Travis CI environment'.yellow.bold);
        execCommand('grunt build');
    }
    else if (process.env.TAG) {
        console.log(('CI: ci-release: "%s"', process.env.TAG).yellow.bold);
        execCommand('grunt ci-release');
        execCommand('npm publish');
    }
    else {
        console.log(('CI: ci-build: "%s"', process.env.BRANCH).yellow.bold);
        execCommand('grunt ci-build');
    }
}

run();
console.error(('CI: OK.').green.bold);
