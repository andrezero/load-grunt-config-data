# load-grunt-config-data

> Load Grunt config files.


## Getting Started

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the
[Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a
[Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

1. Install the utility with this command:

```shell
npm install load-grunt-config-data --save-dev
```

2. Load/merge data from several files into your grunt configuration.

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

### Why!?

There are plenty of Grunt task loaders published in npm. Most of them do a lot of amazing things but, essentially, even
the simpler ones, often in an effort for simplication, end up requiring data in the files to be different form the natural
Grunt config structure.

__Reasons for splitting `Grunfile.js` into multiple files:__
  - separating defaults from configs
  - separating configs from tasks
  - identifying Grunt entry-points
  - clean and focused commits
  - maintainability across different repos
  - space (and isolated scopes) for advanced config features: defaults, overrides, pre-processing, conditionals, dynamically generated, etc...


Solving _ALL_ these problems is quite straightforward:

1. create files
2. __load__ files
3. merge data
4. profit.

Everything else is sugar on top: implicit task names taken form file names, implicit groups, multiple formats supported,
auto initializing Grunt, etc ... But each feature of the _loader_ means something new to learn, more decisions to make
and higher costs of adoption. You need to convert all your data to something new, and you fear that changing your mind
means converting back. Or forward, to the next  _Grunt task loader_ attempt.

I did this for a few days and even contributed to one repo in the process. In the end, a task loader is less than 100LOC
and if there are 15 loaders already in npm, another one won't hurt.

These are the main goals behind this particular one:
- loaded files export data (or a function that returns data)
  - data exported (or returned) should be _natural_ Grunt config structures, and is _NOT_ processed further by `load-grunt-config-data`
  - no file naming convetions
  - no structure created implicitly from file names or paths
  - no loading
- Gruntfile.js is in control of everything:
  - how many calls to the loader
  - order of the calls
  - what to pass to exported functions
  - what to do with the returned data
  - when to merge it
  - when to Grunt.initConfig()


### Methods

#### load(grunt, file|files, [data]): object

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


#### merge(grunt, file|files, config, [data])

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
Use [`grunt.loadTasks()`](http://gruntjs.com/api/grunt.task#grunt.task.loadtasks) for that purpose_

```javascript
// load configs
config = loader.load(grunt, 'grunt/build.conf.js');
loader.merge(grunt, 'grunt/options/, config);
loader.merge(grunt, 'grunt/config', config);

// init grint and load custom tasks
grunt.initConfig(config);
grunt.loadTasks('grunt/tasks');
```

