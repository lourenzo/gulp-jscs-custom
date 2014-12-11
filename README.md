Gulp JSCS Custom Reporter
=========================

Information
-----------

<table>
<tr>
<td>Package</td><td>gulp-jscs-custom</td>
</tr>
<tr>
<td>Description</td>
<td>Gulp plugin for JSCS with custimizable reporters, including Jenkins-friendly Checkstyle. You can output files too.</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.4</td>
</tr>
</table>

Install
-------

`npm install gulp-jscs-custom --save-dev`

Usage
-----

```javascript
var gulp = require('gulp'),
    jscs = require('gulp-jscs-custom');

gulp.task('checkstyle', function () {
    return gulp.src('./**/*.js')
        .pipe(jscs({
            esnext: false,
            configPath: '.jscsrc',
            reporter: 'checkstyle',
            filePath: './jscs.xml'
        }));
});

```

Options
-------

```javascript
{
    esnext: Boolean, // (true | false) Defaults to false
    configPath: String, // if empty, defaults to '.jscsrc'
    reporter: String, // Builtins (checkstyle, console, inline, junit, text)
                      // Or you can add the file path for a custom reporter
                      // Defaults to console
    filePath: String // Output file path. Defaults to null (will print to stdout)
}
```
