# load-grunt-config-data [![Build Status: Linux](https://travis-ci.org/andrezero/load-grunt-config-data.png?branch=master)](https://travis-ci.org/andrezero/load-grunt-config-data)

> Load Grunt config files.


## Getting Started

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the
[Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a
[Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

Install the utility with this command:

```shell
npm install load-grunt-config-data --save-dev
```

Load/merge data from several files into your grunt configuration.

You can do so directly in your `Gruntfile.js` file before you invoke `grunt.initConfig()`:

```javascript
var loader = require('load-grunt-config-data');

// initialize config
var config = {pkg: grunt.file.readJSON('./package.json')};

// load configuration (if some file exports an fn() a deep clone of `config` is provided to it)
grunt.util._.merge(config, loader.load(grunt, 'grunt/build.conf.js'));

// OR merge configuration (similiar as above, but the config object is extended with data loaded from files)
loader.merge(grunt, 'grunt/tasks/**/*.js', config);

// init config
grunt.initConfig(config);
```

## The "load-grunt-config-data" utility

### Overview

Because the world needs another Grunt config loader (scroll down to learn Why?!).

__These are the main goals behind this utility:__

- Loaded files export data (or a function that returns data)
  - data exported (or returned) should be _natural_ Grunt config structures, and is _NOT_ processed further by `load-grunt-config-data`
  - no file naming convetions
  - no structure created implicitly from file names or paths
  - no loading data into Grunt
- Gruntfile.js is in control of everything:
  - how many calls to the loader
  - order of the calls
  - what to pass to exported functions
  - what to do with the returned data
  - when to merge it
  - when to Grunt.initConfig()


### Methods

#### Constructor()

__Returns:__

`Object` - Module api.

__Example:__

```javascript
var loader = require('load-grunt-config-data');
```

#### + loader.load(grunt, file|files, [data]): object

Loads all files that match `file|files` files, merges everything and returns the result. A deep clone of the optional
`data` argument is passed as a second argument to functions exported by loaded files.

__Arguments:__

- __grunt__ : `Object` - Grunt instance.
- __file|files__ : `String|Array` - One or more paths/files, may contain `glob` patterns, including `!negatives`.
- __data__ : `Object` - Optional data you want to pass into functions exported by loaded files.

__Returns:__

`Object` - Loaded data.

__Example:__

```javascript
var loader = require('load-grunt-config-data');
grunt.util._.merge(data, loader.load(grunt, ['files/**/*.js', 'fies/file.js']));
```

_Note: if several files define overlapping data the last files to be loaded override the previous. If order matters to
you, you can specify a file more than once, like in the example above. Worst case scenario, split into separate calls
in order to control which data prevails._


#### + loader.merge(grunt, file|files, config, [data])

Loads all files that match `file|files`, merges everything into the `config` argument. A deep clone of the optional
`data` argument is passed as a second argument to functions exported by loaded files.

__Arguments:__

- __grunt__ : `Object` - Grunt instance.
- __file|files__ : `String|Array` - One or more paths/files, may contain `glob` patterns, including `!negatives`.
- __config__ : `Object` - Loaded data is merged into this object.
- __data__ : `Object` - Optional data you want to pass into functions exported by loaded files.

__Example:__

```javascript
var loader = require('load-grunt-config-data');
loader.merge(grunt, ['files/**/*.js', 'file.js'], config);
```

### Config files

Strictly speaking you can define any arbitrary data and assemble the results accordingly in your `Grunftile.js` before
you call `grunt.initConfig(config)` but the examples here assume files contain _natural_ Grunt config structures.

__Files can either export config:__

```javascript
module.exports = {
    changelog: {
        options: {
            dest: 'CHANGELOG.md',
            template: 'changelog.tpl'
        }
    }
};
```

__Or a function that returns config.__

This function is provided with `grunt` and a clone of whatever data you pass to `load()` or `merge()`.

```javascript
module.exports = function (grunt, data) {

    return {
        changelog: {
            options: {
                dest: 'CHANGELOG.md',
                template: 'changelog.tpl'
            }
        }
    };
};
```

### --verbose

Troubleshooting a complex configuration can be quite expensive.

If execute Grunt run with `--verbose` this tool will produce a nice verbose output of files where loaded and what they
declared:

```javascript
$ grunt something:something --verbose

Loading grunt configs via "load-grunt-config-data" from 3 file(s).
Loading grunt/options/bump.js...OK
+ bump: [options]

Loading grunt/options/changelog.js...OK
+ bump: [changelog]

Loading grunt/config/build.js...is fn(), invoking...OK
+ clean: [build]
+ less: [build]
+ copy: [vendors, src]
+ karma: [unit]
+ shell: [coverage]
```

### Example

The loader is totally agnostic to what's in the files but we're using it to quickly load Grunt configs and put it all
together in our `Grunfile.js`.

One directory holds just defaults, another one holds tasks/targets, groupped per major Grunt entry-point, and a final
one holds custom tasks:

```
./grunt
    /options
        /bump.js
        /changelog.js
        /clean.js
        /concat.js
        /copy.js
        /delta.js
        /jsbeautifier.js
        /jshint.js
        /karma.js
        /less.js
        /meta.js
        /ngindex.js
        /nginx.js
        /shell.js
        /uglify.js
    /config
        /build.js
        /dist.js
        /watch.js
        /docs.js
    /tasks
        /build.js
        /dist.js
        /watch.js
        /docs.js
    ...
```

An example `options` file, just contains default `options` for this task only.

```javascript
// grunt/options/changelog.js
module.exports = {
    changelog: {
        options: {
            dest: 'CHANGELOG.md',
            template: 'changelog.tpl'
        }
    }
};
```

An example `config` file, that contains all the tasks and targets involed in the custom `build` task:

```javascript
// grunt/config/build.js
module.exports = {
    less: {
        main: {
            src: '<%= paths.src %>/main.less',
            dest: '<%= paths.build %>/<%= pkg.name %>.css'
        }
    },
    copy: {
        vendors: {
            files: [{
                src: [
                    '<%= files.vendors %>'
                ],
                dest: '<%= paths.build %>/'
            }]
        }
    },
    {
        // ... omitted for the sake of brevity
    }
};

```

An example `tasks` file, contains custom tasks.

_Note: these tasks are not supposed to be loaded by the loader.
Use [`grunt.loadTasks()`](http://gruntjs.com/api/grunt.task#grunt.task.loadtasks) for that purpose:_

```javascript
// load configs
config = loader.load(grunt, 'grunt/build.conf.js');
loader.merge(grunt, 'grunt/options/', config);
loader.merge(grunt, 'grunt/config', config);

// init Grunt
grunt.initConfig(config);

// load custom tasks
grunt.loadTasks('grunt/tasks');
```


### Why another Grunt config loader?

There are plenty of Grunt config loaders published in npm. Most of them do a lot of amazing things but essentially, even
the simpler ones, often in an effort for simplication, end up requiring data in the files to be different form the natural
Grunt config structure.

__Reasons for splitting `Grunfile.js` into multiple files:__
  - separating defaults from configs
  - separating configs from tasks
  - identifying Grunt entry-points
  - clean and focused commits
  - maintainability across different repos
  - enabling advanced config features: defaults, overrides, pre-processing, conditionals, dynamically generated, etc...

__Solving _ALL_ these problems is quite straightforward:__

1. create files
2. __load__ files
3. merge data
4. profit

Everything else is sugar on top: implicit task names taken form file names, implicit groups, multiple formats supported,
auto initializing Grunt, etc ... But each feature of the _loader_ means something new to learn, more decisions to make
and higher costs of adoption. You need to convert all your data to something new, and you fear that changing your mind
means converting back. Or forward, to the next  _Grunt task loader_ attempt.

I did this for a few days and even contributed to one repo in the process. In the end, a task loader is less than 100LOC
and if there are 15 loaders already in npm, another one won't hurt.


---

## Roadmap

- test coverage
- BREAKING: refactor Constructor to accept Grunt as argument #1, refactor load() and merge() no need to pass Grunt again


## Credits and Acknowlegdments

Thank you [Jaime Beneitez](https://github.com/ngbp/ngbp) for raising the standard on how to setup uniform grunt task
configurations across our growing ecosystem of libraries and apps over at [EF CTX](https://github.com/EFEducationFirst).


## [MIT License](LICENSE-MIT)

[Copyright (c) 2014 Andre Torgal](http://andrezero.mit-license.org/2014)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
