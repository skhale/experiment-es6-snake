import gulp from 'gulp';
import uglify from 'gulp-uglify';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

gulp.task('build', () => {
    return browserify('src/js/app.js', { debug: true })
        .transform(babelify, { presets: ['es2015'] })
        .bundle()
        .pipe(source('app.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('src'));
});

gulp.task('watch', ['build'], () => gulp.watch('src/js/*.js', ['build']) );
gulp.task('default', ['build']);
