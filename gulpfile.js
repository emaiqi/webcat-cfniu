var gulp = require('gulp-help')(require('gulp')),
  rename = require('gulp-rename'),
  clean = require('gulp-clean'),
  sequence = require('gulp-sequence'),
  //gulpif = require('gulp-if'),
  replace = require('gulp-replace'),
  sass = require('gulp-sass'),
  proxy = require('http-proxy-middleware'),
  bs = require('browser-sync').create(),
  argv = require('minimist')(process.argv.slice(2)),
  notify = require("gulp-notify"),
  path = require('path'),
  fs = require('fs'),
  colors = require('colors'),
  program = require('commander'),
  Promise = require('bluebird'),
  imagemin = require('gulp-imagemin'),
package = require('./package.json');

// 构建项目
gulp.task('build', '构建项目>>> gulp build', sequence('clean', ['build-image','build-extname-wxml', 'build-extname-wxss', 'build-js', 'build-json'], 'watch'));

//监听项目
gulp.task('watch', '项目监听>>> gulp watch', function() {
  gulp.watch(['./src/**/**/*.html', './src/**/*.html', './src/*.html'], ['build-extname-wxml']);
  gulp.watch(['./src/**/**/*.scss', './src/**/*.scss', './src/*.scss'], ['build-extname-wxss']);
  gulp.watch(['./src/**/**/*.js', './src/**/*.js', './src/*.js'], ['build-js']);
  gulp.watch(['./src/**/**/*.json', './src/**/*.json', './src/*.json'], ['build-json']);
});

// 清理项目
gulp.task('clean', '清理项目>>> gulp clean', function() {
  return gulp.src(['pages', './*.log', './app.wxss', './app.json', './app.js', './app.wxml'])
    .pipe(clean());
});

gulp.task('add', '添加文件>>> gulp add --dir=./src/pages/test --name=test', function() {
  var dir = argv.dir;
  var name = argv.name;
  if (!dir || !name) {
    printError('参数错误，例如：gulp add --dir=./src/pages/test --name=test');
  } else {
    createDir(dir).then(function() {
      var filesFun = [];
      console.log('待添加文件==>>'.green + colors.green(package.gulpConfig.wxExt));
      for (var ext of package.gulpConfig.wxExt) {
        filesFun.push(createFile(dir, '/' + name + ext));
      }
      Promise.all(filesFun).then(function() {
        return true;
      })
    }, function(err) {
      printError(err);
    })
  }
});

function createDir(dir) {
  try {
    return new Promise(function(resolve, reject) {
      if (!fs.existsSync(dir)) {
        console.log('开始创建路径==>' + dir);
        var pathtmp;
        dir.split('/').forEach(function(dirname) {
          if (pathtmp) {
            pathtmp = path.join(pathtmp, dirname);
          } else {
            pathtmp = dirname;
          }
          if (!fs.existsSync(pathtmp)) {
            console.log('开始创建路径==>' + pathtmp);
            if (!fs.mkdirSync(pathtmp)) {
              return false;
            }
          }
        });
      }else{
        fs.stat(dir,function(err,stats){
          console.log(stats);
        })
        //reject(dir+'目录已存在');
      }
    })
  } catch (e) {
    printError(e);
    reject();
  }
}

function createFile(path, name) {
  try {
    console.log('开始创建==>'.green + path.green + name.green);
    return fs.writeFileSync(path + name);
  } catch (e) {
    printError(e);
  }
}

function printError(err) {
  console.error(colors.red(err));
  return false;
}
// 本地开发服务模拟
gulp.task('server', '启动服务>>>todo', ['build'], function() {
  // 代理配置2
  var context = ['**/*.api*', '/common/**'],
    options = {
      target: "http://192.168.1.87:9080",
    };
  // create the proxy 
  var proxy = proxyMiddleware(context, options);
  bs.init({
    server: {
      baseDir: ['dev/', '../com.com.9niu.api/sit/']
    },
    host: "dev.9niutest.com",
    middleware: [proxy],
    open: "external",
    browser: "chrome"
  });
});

gulp.task('build-image',function(){
  return gulp.src('./src/resources/image/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/resources/image/'));
  })
// build wx js
gulp.task('build-js', function() {
  return gulp.src(['./src/**/**/*.js', './src/**/*.js', './src/*.js'])
    .pipe(replace('[$apiUrl]', package.gulpConfig.apiUrl))
    .pipe(gulp.dest('./dist'));
});
// build wx json
gulp.task('build-json', function() {
  return gulp.src(['./src/**/**/*.json', './src/**/*.json', './src/*.json'])
    .pipe(gulp.dest('./dist'));
});
// build wx wxml
gulp.task('build-extname-wxml', function() {
  return gulp.src(['./src/**/**/*.html', './src/**/*.html', './src/*.html'])
    .pipe(rename(function(path) {
      path.extname = '.wxml';
    }))
    .pipe(gulp.dest('./dist'));
});
// build wx css
gulp.task('build-extname-wxss', function() {
  return gulp.src(['./src/**/**/*.scss', './src/**/*.scss', './src/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(rename(function(path) {
      path.extname = '.wxss';
    }))
    .pipe(gulp.dest('./dist'));
});
