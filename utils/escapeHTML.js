// source: https://gist.github.com/shashankvivek/de2b0caf5200d32105b2c33c115490ed#file-app-js
function escapeHTML(text) {
    const tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };

    return text.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};

exports.escapeHTML = escapeHTML;
