var through2 = require('through2'),
    gutil = require('gulp-util'),
    crypto = require('crypto'),
    path = require('path');

function hashDigest(opts) {
  return through2.obj(function(file, enc, cb) {
    if (file.isBuffer() || file.isStream()) {
      var hasher = crypto.createHash('md5');

      var doneHashing = function() {
        var hexDigest = hasher.digest('hex');
        this.push(new gutil.File({
          path: path.basename(file.relative) + '.hash',
          contents: new Buffer(hexDigest + '\n')
        }));
        this.push(file);
        cb();
      }.bind(this);

      if (file.isBuffer()) {
        hasher.update(file.contents);
        doneHashing();
      }

      if (file.isStream()) {
        var newContents = through2();
        file.pipe(through2(function(chunk, enc, updateCb) {
          hasher.update(chunk, enc);
          updateCb(null, chunk);
        }, function(flushCb) {
          doneHashing();
          flushCb();
        })).pipe(newContents);
        file.contents = newContents;
      }
    } else {
      this.push(file);
      cb();
    }
  });
}

module.exports = hashDigest;

