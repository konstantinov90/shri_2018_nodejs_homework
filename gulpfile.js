const gulp = require('gulp');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');

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
		.pipe(gulp.dest('dist/js'))
);

gulp.task('dev', ['watcher', 'nodemon']);

gulp.task('build', ['build:js']);
