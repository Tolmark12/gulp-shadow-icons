// Generated by CoffeeScript 1.10.0
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
      var fileName, namespace, uniqueStr;
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
        namespace = fileName + "-svg ";
        uniqueStr = Date.now().toString(36);
        this.push(getJavascriptFile(file, fileName, options.jsDest, options.jsRegex, namespace, uniqueStr));
        this.push(getCssFile(file, fileName, options.cssDest, options.cssRegex, namespace, uniqueStr));
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

  getJavascriptFile = function(file, fileName, jsPath, regexAr, namespace, uniqueStr) {
    var data, i, len, regex;
    data = file.contents.toString();
    data = data.replace(/<\?xml.+/g, '');
    data = data.replace(/<!-- Gen.+/g, '');
    data = data.replace(/<!DOC.+/g, '');
    data = data.replace(/<style[\s\S]*<\/style>/g, '');
    data = data.replace(/(class="st[0-9]+)/g, "$1_" + uniqueStr);
    data = data.replace(/(SVGID_[0-9]+_)/g, "$1" + uniqueStr);
    data = data.replace(/<text(.+?(class="(.+?)"|<tspan)+?(.+?<tspan.+?class="(.+?)"))/g, '<text class="$3 $5" $1');
    data = data.replace(/<tspan.+?>(.+?)<\/tspan>/g, '$1');
    data = data.replace(/(<g id=".+)_x60_(.+?)x(.+?)"/g, '$1" data-size="$2x$3"');
    data = data.replace(/_x5F_/g, '_');
    data = data.replace(/id="(.+)?_x[23]E_(.+?)"/g, 'id="$1" class="$2" ');
    data = data.replace(/class="([a-z0-9\-_]+)"\s+class="([a-z0-9\-_]+)"/g, 'class="$1 $2"');
    data = data.replace(/id=""/g, '');
    data = data.replace(/(<g id.+")/g, "$1 class=\"" + namespace + "\"");
    data = data.replace(/_x2C_/g, ' ');
    data = data.replace(/class="(.+)_[0-9]+_(.*)"/g, 'class="$1 $2"');
    data = data.replace(/\/>\s+/g, '/>');
    data = data.replace(/\n|\r/g, '');
    data = data.replace(/<svg.+?>([\s\S]*)<\/svg>/g, '$1');
    data = data.replace(/([\s\S]*)/g, "var pxSvgIconString = pxSvgIconString || ''; pxSvgIconString+='$1';");
    for (i = 0, len = regexAr.length; i < len; i++) {
      regex = regexAr[i];
      data = data.replace(regex.pattern, regex.replace);
    }
    return makeFile(data, file, jsPath, fileName + '.js');
  };

  getCssFile = function(file, fileName, cssPath, regexAr, namespace, uniqueStr) {
    var data, i, len, regex;
    data = file.contents.toString();
    data = data.replace(/(\.st[0-9]+)/g, "$1_" + uniqueStr);
    data = data.replace(/(font-size:[0-9\.]+);/g, '$1px;');
    data = data.replace(/[\s\S]*<style type="text\/css">([\s\S]*)<\/style>[\s\S]*/g, '$1');
    data = data.replace(/enable-background:new\s+;/g, '');
    data = data.replace(/\s+(\.[a-z0-9]+?{.+)/g, "." + namespace + "$1\n");
    for (i = 0, len = regexAr.length; i < len; i++) {
      regex = regexAr[i];
      data = data.replace(regex.pattern, regex.replace);
    }
    return makeFile(data, file, cssPath, fileName + '.css');
  };

  module.exports = gulpShadowPlugin;

}).call(this);
