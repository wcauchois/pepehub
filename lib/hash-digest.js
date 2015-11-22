var through2 = require('through2'),
    gutil = require('gulp-util'),
    crypto = require('crypto'),
    path = require('path');

function hashDigest(opts) {
  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
    } else {
      var hasher = crypto.createHash('md5');

      var doneHashing = function() {
        var hexDigest = hasher.digest('hex');
        this.push(new gutil.File({
          path: path.basename(file.relative) + '.hash',
          contents: new Buffer(hexDigest + '\n')
        }));
        cb();
      }.bind(this);

      file.contents = file.pipe(through2(function(chunk, enc, updateCb) {
        hasher.update(chunk, enc);
        updateCb(null, chunk);
      }, function(flushCb) {
        doneHashing();
        flushCb();
      }));

      this.push(file);
    }
  });
}

module.exports = hashDigest;

