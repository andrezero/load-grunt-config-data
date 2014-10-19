#!/usr/bin/env node
var sh = require('execSync');
var util = require('util');

function execCommand(command) {
    console.log(util.format('Executing "%s"\n', command));
    var exec = sh.exec(command);
    console.log(exec.stdout);
    if (exec.code) {
        exit(exec.code);
    } else {
        console.log(util.format('"%s": done.', command));
    }
}

if (!process.env.TRAVIS) {
    execCommand('grunt build');
}
else if (process.env.TAG) {
    execCommand('grunt ci-release');
    execCommand('npm publish');
}
else {
    execCommand('grunt ci-build');
}