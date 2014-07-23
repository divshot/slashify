var qs = require('querystring');
var url = require('fast-url-parser');
var join = require('path').join;
var fileExists = require('file-exists');

module.exports = function (options) {
  options = options || {};
  
  /*
  DEFAULTS
  ===============
  {
    root: './',
    index: 'index.html',
    directory: true
    exists: undefined
  }
   */
  
  var root = options.root || './';
  var indexFile = options.index || 'index.html';
  var leaveOnDirectory = (options.directory || options.directory === undefined) ? true : false;
  
  if (options.exists) fileExists = options.exists;
  
  return function (req, res, next) {
    var pathname = url.parse(req.url).pathname;
    
    if (isDirectoryIndex() && !hasTrailingSlash()) return redirect(join(pathname, '/')); // Don't remove tailing slash on directory index file
    if (isDirectoryIndex()) return next();
    if (pathname !== '/' && hasTrailingSlash()) return redirect(pathname.substring(0, pathname.length - 1));
    
    // pathname looks ok
    next();
    
    function redirect (redirectUrl) {
      var query = qs.stringify(req.query);
      
      redirectUrl += (query) ? '?' + query : '';
      res.writeHead(301, {Location: redirectUrl});
      res.end();
    }
    
    function isDirectoryIndex () {
      return fileExists(join(root, req.url, indexFile));
    }
    
    function hasTrailingSlash () {
      return pathname.substr(-1) === '/';
    }
  };
};