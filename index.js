'use strict';

var gutil = require('gulp-util'),
    through = require('through2'),
    fs = require('fs'),
    Checker = require('jscs'),
    loadConfigFile = require('jscs/lib/cli-config'),
    assign = require('object-assign');

/**
 * load a proper Reporter
 * @return {Function} the selected report
 */
function loadReporter(reporterPath) {
    var reporter;
    reporterPath = reporterPath || 'console';
    if (!fs.existsSync(reporterPath)) {
        try {
            reporter = require('./lib/reporters/' + reporterPath);
        } catch (e) {
            try {
                reporter = require('jscs/lib/reporters/' + reporterPath);
            }
            catch (e) {
                return null;
            }
        }
    } else {
        try {
            reporter = require(reporterPath);
        } catch (e) {
            return null;
        }
    }
    return reporter;
}

/**
 * The Gulp Plugin itself
 * @param  {Object} options
 * @return {Stream}
 */
module.exports = function (options) {
    options = assign({
        esnext: false,
        configPath: '.jscsrc', // @todo: check if this file
        reporter: 'checkstyle',
        filePath: 'jscs.xml',
        config: null
    }, options || {});

    var configFile = loadConfigFile.load(options.configPath),
        config = assign({}, configFile, options.config),
        checker, reporter, gulpStream,
        results = [];

    // Checker Instance
    checker = new Checker({esnext: !!options.esnext});
    checker.registerDefaultRules();
    checker.configure(config);

    // Reporter
    reporter = loadReporter(options.reporter);

    gulpStream = through.obj(function (file, enc, cb) {

        if (file.isNull()) {
            return cb(null, file);
        }
        if (file.isStream()) {
            return cb(new gutil.pluginError('Streaming not supported at this time'));
        }
        if (checker.getConfiguration().isFileExcluded(file.path)) {
            return cb(null, file);
        }

        try {
            var lintErrors = checker.checkString(file.contents.toString(), file.relative);
            if (lintErrors._errorList.length) {
                results.push(lintErrors);
            }
        } catch (err) {
            return cb(new gutil.pluginError(err.message.replace('null:', file.relative + ':')));
        }
        return cb(null, file);
    }, function (cb) {
        //console.log(results);
        if (results.length > 0) {
            console.log(reporter(results));
            cb();
        } else {
            cb();
        }
    });
    return gulpStream;
};
