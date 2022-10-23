function htmlEncode(str) {
  return String(str).replace(/[^\w. ]/gi, (c) => `&#${c.charCodeAt(0)};`);
}

exports.htmlEncode = htmlEncode;
