const gulp = require('gulp');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const stylus = require('gulp-stylus');
const minify = require('gulp-minify');

const isProd = process.env.NODE_ENV === 'production';

gulp.task('nodemon', () => {
	nodemon({
		script: 'server/main.js',
		watch: '*',
		ext: 'js properties',
		ignore: ['node_modules/', 'src'],
		env: {
			NODE_ENV: 'development',
		},
	})
});

gulp.task('watcher', () => {
	gulp.watch('src/js/*.js', ['build:js']);
});
 
gulp.task('build:js', () =>
	gulp.src('src/js/*.js')
		.pipe(babel({
			presets: [[
				'env', {
					targets: {
						browsers: ["defaults", "not ie <= 8"]
					},
				}
			]],
		}))
		.pipe(minify({
      ext: {
        min: isProd ? '.js' : '-min.js',
      },
			noSource: isProd,
    }))
		.pipe(gulp.dest('dist/js'))
);

gulp.task('build:styl', function() {
  return gulp.src('src/styles/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('dev', ['build', 'watcher', 'nodemon']);

gulp.task('build', ['build:js', 'build:styl']);
