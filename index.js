// Generated by CoffeeScript 1.7.1
(function() {
  var File, getCssFile, getJavascriptFile, gulpShadowPlugin, gutil, makeFile, through;

  gutil = require('gulp-util');

  through = require('through2');

  File = require('vinyl');

  gulpShadowPlugin = function(options) {
    var stream;
    if (options == null) {
      options = {};
    }
    stream = through.obj(function(file, enc, cb) {
      var fileName;
      if (file.isStream()) {
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, "Streams aren't supported"));
        return cb();
      }
      if (file.isBuffer()) {
        fileName = file.relative.split(".")[0];
        options.cssDest || (options.cssDest = "");
        options.jsDest || (options.jsDest = "");
        options.cssNamespace || (options.cssNamespace = "");
        options.cssRegex || (options.cssRegex = []);
        options.jsRegex || (options.jsRegex = []);
        this.push(getJavascriptFile(file, fileName, options.jsDest, options.jsRegex));
        this.push(getCssFile(file, fileName, options.cssDest, options.cssRegex, options.cssNamespace));
      }
      return cb();
    });
    return stream;
  };

  makeFile = function(data, file, subDir, fileName) {
    return new File({
      cwd: file.cwd,
      base: file.base,
      path: file.base + subDir + fileName,
      contents: new Buffer(data)
    });
  };

  getJavascriptFile = function(file, fileName, jsPath, regexAr) {
    var data, regex, _i, _len;
    data = file.contents.toString();
    data = data.replace(/<\?xml.+/g, '');
    data = data.replace(/<!-- Gen.+/g, '');
    data = data.replace(/<!DOC.+/g, '');
    data = data.replace(/<style[\s\S]*<\/style>/g, '');
    data = data.replace(/<text(.+?(class="(.+?)"|<tspan)+?(.+?<tspan.+?class="(.+?)"))/g, '<text class="$3 $5" $1');
    data = data.replace(/<tspan.+?>(.+?)<\/tspan>/g, '$1');
    data = data.replace(/_x5F_/g, '_');
    data = data.replace(/id="(.+)?_x[23]E_(.+?)"/g, 'id="$1" class="$2" ');
    data = data.replace(/class="([a-z0-9-_]+)"\s+class="([a-z0-9-_]+)"/g, 'class="$1 $2"');
    data = data.replace(/id=""/g, '');
    data = data.replace(/_x2C_/g, ' ');
    data = data.replace(/class="([a-z0-9\-\s]+).*?"/g, 'class="$1"');
    data = data.replace(/\/>\s+/g, '/>');
    data = data.replace(/\n|\r/g, '');
    data = data.replace(/<svg.+?>([\s\S]*)<\/svg>/g, '$1');
    data = data.replace(/(<symbol[\s\S]*symbol>)([\s\S]*)/g, "var pxSymbolString = pxSymbolString || ''; pxSymbolString+='$1';\nvar pxSvgIconString = pxSvgIconString || ''; pxSvgIconString+='$2';");
    for (_i = 0, _len = regexAr.length; _i < _len; _i++) {
      regex = regexAr[_i];
      data = data.replace(regex.pattern, regex.replace);
    }
    return makeFile(data, file, jsPath, fileName + '.js');
  };

  getCssFile = function(file, fileName, cssPath, regexAr, namespace) {
    var data, regex, _i, _len;
    data = file.contents.toString();
    data = data.replace(/(font-size:[0-9\.]+);/g, '$1px;');
    data = data.replace(/[\s\S]*<\!\[CDATA\[([\s\S]*)\]\]>[\s\S]*/g, '$1');
    data = data.replace(/enable-background:new\s+;/g, '');
    data = data.replace(/\s+(\.[a-z0-9]+?{.+)/g, "" + namespace + " $1\n");
    for (_i = 0, _len = regexAr.length; _i < _len; _i++) {
      regex = regexAr[_i];
      data = data.replace(regex.pattern, regex.replace);
    }
    return makeFile(data, file, cssPath, fileName + '.css');
  };

  module.exports = gulpShadowPlugin;

}).call(this);
