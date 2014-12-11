'use strict';

function escapeAttrValue(attrValue) {
    return (attrValue || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

module.exports = function (errorCollection) {
    var out = [];

    out.push('<?xml version="1.0" encoding="utf-8"?>\n<checkstyle version="4.3">');
    errorCollection.forEach(function (errors) {
        out.push('    <file name="' + escapeAttrValue(errors.getFilename()) + '">');
        errors.getErrorList().forEach(function (error) {
            out.push(
                '        <error ' +
                'line="' + error.line + '" ' +
                'column="' + (error.column + 1) + '" ' +
                'severity="error" ' +
                'message="' + escapeAttrValue(error.message) + '" ' +
                'source="jscs" />'
            );
        });
        out.push('    </file>');
    });
    out.push('</checkstyle>');
    return out.join('\n');
};
