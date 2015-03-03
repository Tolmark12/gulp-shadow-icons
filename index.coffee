gutil          = require 'gulp-util'     # gulp-util is used to created well-formed plugin errors
through        = require 'through2'
File           = require 'vinyl'

gulpShadowPlugin = (options={})->
  stream = through.obj (file, enc, cb)->
    if file.isStream()
      @emit 'error', new gutil.PluginError PLUGIN_NAME, "Streams aren't supported"
      return cb()

    if file.isBuffer()
      fileName = file.relative.split(".")[0]

      # Options
      options.cssDest       ||= ""
      options.jsDest        ||= ""
      options.cssNamespace  ||= ""

      @push getJavascriptFile file, fileName, options.jsDest
      @push getCssFile file, fileName, options.cssDest, options.cssNamespace

    cb()
  return stream

## -------------------------------------------------- ##
##                                            HELPERS ##
## -------------------------------------------------- ##

makeFile = (data, file, subDir, fileName)->
  new File
    cwd:      file.cwd
    base:     file.base
    path:     file.base + subDir + fileName
    contents: new Buffer data

       #    #    #     #    #     #####   #####  ######  ### ######  #######
       #   # #   #     #   # #   #     # #     # #     #  #  #     #    #
       #  #   #  #     #  #   #  #       #       #     #  #  #     #    #
       # #     # #     # #     #  #####  #       ######   #  ######     #
 #     # #######  #   #  #######       # #       #   #    #  #          #
 #     # #     #   # #   #     # #     # #     # #    #   #  #          #
  #####  #     #    #    #     #  #####   #####  #     # ### #          #

getJavascriptFile = (file, fileName, jsPath) ->
  data = file.contents.toString()
  data = data.replace /<\?xml.+/g, ''                                                                               # Strip out the xml header
  data = data.replace /<!-- Gen.+/g, ''                                                                             # Strip out the Adobe Generator comment
  data = data.replace /<!DOC.+/g, ''                                                                                # Strip out the DOCTYPE
  data = data.replace /<style[\s\S]*<\/style>/g, ''                                                                 # Strip out the generated css
  data = data.replace /<text(.+?(class="(.+?)"|<tspan)+?(.+?<tspan.+?class="(.+?)"))/g, '<text class="$3 $5" $1' ;  # illustrator does this weird thing with tspans.. grab the class and attach it to the text element
  data = data.replace /<tspan.+?>(.+?)<\/tspan>/g, '$1'                                                             # Get rid of the tspans
  data = data.replace /_x5F_/g, '_'                                                                                 # Replace _x5F_'s with _'s (illustrator's character for underscore)
  data = data.replace /id="(.+)?_x[23]E_(.+?)"/g, 'id="$1" class="$2" '                                             # id / class id>class1,class2,class3
  data = data.replace /class="([a-z0-9 ]+)"\s+class="([a-z0-9]*)"/g, 'class="$1 $2"'                                  # After doing the previous line, we sometimes have two classes on the same element, combine them
  data = data.replace /id=""/g, ''                                                                                  # Delete empty ids
  data = data.replace /_x2C_/g, ' '                                                                                 # Replace all commas between class with spaces
  data = data.replace /class="([a-z0-9\-\s]+).*?"/g, 'class="$1"'                                                   # Strip out superfluous underscores illustrator adds to duplicate layer names
  data = data.replace /\/>\s+/g, '/>'                                                                               # remove superfluous spaces
  data = data.replace /\n|\r/g, ''                                                                                  # Strip out all returns
  data = data.replace /<svg.+?>([\s\S]*)<\/svg>/g, '$1'                                                             # Strip out svg tags
  data = data.replace /(<symbol[\s\S]*symbol>)([\s\S]*)/g, "var pxSymbolString = pxSymbolString || ''; pxSymbolString+='$1';\nvar pxSvgIconString = pxSvgIconString || ''; pxSvgIconString+='$2';" # Save the symbols and svgs
  return makeFile data, file, jsPath, fileName + '.js'


  ####   ####   ####
 #    # #      #
 #       ####   ####
 #           #      #
 #    # #    # #    #
  ####   ####   ####

getCssFile = (file, fileName, cssPath, namespace) ->
  data = file.contents.toString()
  data = data.replace /(font-size:[0-9\.]+);/g, '$1px;'                   # Add px to the css font sizes
  data = data.replace /[\s\S]*<\!\[CDATA\[([\s\S]*)\]\]>[\s\S]*/g, '$1'   # Strip out everything but the css (reminder [\s\S]* is js multiline equivalent to .* )
  data = data.replace /enable-background:new\s+;/g, ''                    # Remove the enable-background:new data illustrator uses
  data = data.replace /\s+(\.[a-z0-9]+?{.+)/g, "#{namespace} $1\n"        #prefix the tags with the namespace and add a hard return
  return makeFile data, file, cssPath, fileName + '.css'



module.exports = gulpShadowPlugin
