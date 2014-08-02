var Util = require('./util')
var xhr = require('xhr')
var log = require('./log')
var path = require('path-browserify')
var Module = require('./module')

function Package(packagePath) {
  this.packagePath = packagePath
}

pkProto = Package.prototype

pkProto.getPackageJson = function(done) {
  xhr({
    uri: this.packagePath,
    headers: {
      "Content-Type": "application/json"
    }
  }, function(err, resp, body) {
    if (err) {
      return done(err)
    }
    try {
      done(err, JSON.parse(body))
    } catch (err) {
      done(err)
    }
  })
}

pkProto.getMainModule = function(done) {
  var that = this
  this.getPackageJson(function(err, packageJson) {
    if (err) {
      return done(err)
    }
    var mainScriptPath = packageJson.main || 'index.js'
    if (mainScriptPath.slice(mainScriptPath.length - 3, mainScriptPath.length) !== '.js') {
      mainScriptPath = mainScriptPath + '.js'
    }
    mainScriptPath = path.normalize(path.dirname(that.packagePath) + '/' + mainScriptPath)
    if (Module.cache(mainScriptPath)) {
      done(null)
      log('module.load:', mainScriptPath + ' is loaded')
    } else {
      var md = new Module(mainScriptPath)
      Module.cache(md)
      md.load(done)
    }
    var mainModule = new Module(mainScriptPath)
    done(null, mainModule)
  })
}

pkProto.load = function(done) {
  this.getMainModule(function(err, mainModule) {
    if (err) {
      return done(err)
    }
    mainModule.load(done)
  })
}

pkProto.run = function() {

}

exports.Package = Package