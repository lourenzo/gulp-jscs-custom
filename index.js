'use strict';

var gutil = require('gulp-util'),
    through = require('through2'),
    fs = require('fs'),
    Checker = require('jscs'),
    loadConfigFile = require('jscs/lib/cli-config'),
    assign = require('object-assign'),
    path = require('path');

/**
 * load a proper Reporter
 * @todo Throw error when no reporter was found
 * @return {Function} the selected report
 */
function loadReporter(reporterPath) {
    var reporter;
    reporterPath = reporterPath || 'checkstyle';
    if (!fs.existsSync(path.resolve(reporterPath))) {
        try {
            reporter = require('./lib/reporters/' + reporterPath);
        } catch (e) {
            try {
                reporter = require('jscs/lib/reporters/' + reporterPath);
            }
            catch (e) {
                reporter = null;
            }
        }
    } else {
        try {
            reporter = require(path.resolve(reporterPath));
        } catch (e) {
            reporter = null;
        }
    }
    return reporter;
}

/**
 * Write Output
 * @param  {String}   filePath defaults to null (console.log)
 * @param  {String}   content  Content to be written
 * @param  {Function} cb       Callback function
 */
function writeOutput(filePath, content, cb) {
    var outStream;
    if (!filePath) {
        if (content) {
            console.log(content);
        }
        return cb(new gutil.PluginError('gulp-jscs-custom', 'JSCS validation failed', {
            showStack: false
        }));
    }
    outStream = fs.createWriteStream(filePath);
    outStream.write(content, null, cb);
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
        reporter: 'console',
        filePath: null,
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
            var lintErrors = checker.checkString(file.contents.toString(), file.path.replace(file.cwd + '/', ''));
            if (lintErrors._errorList.length) {
                results.push(lintErrors);
            }
        } catch (err) {
            return cb(new gutil.PluginError('gulp-jscs-custom', err.message.replace('null:', file.relative + ':')));
        }
        return cb(null, file);
    }, function (cb) {
        if (results.length > 0) {
            writeOutput(options.filePath, reporter(results), cb);
        } else {
            cb();
        }
    });
    return gulpStream;
};
