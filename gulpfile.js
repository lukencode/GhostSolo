const { series, watch, src, dest, parallel } = require('gulp');
const pump = require('pump');

// gulp plugins and utils
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');
var zip = require('gulp-zip');
var uglify = require('gulp-uglify');
var beeper = require('beeper');

// plugins
var autoprefixer = require('autoprefixer');
var colorFunction = require('postcss-color-function');
var cssnano = require('cssnano');
var easyimport = require('postcss-easy-import');
var purgecss = require('gulp-purgecss')
var sass = require('gulp-sass');
sass.compiler = require('node-sass');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function(err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    var processors = [
        easyimport,
        colorFunction(),
        autoprefixer(),
        cssnano()
    ];

    pump([
        src('assets/css/theme.scss', { sourcemaps: true }),
        sass(),
        postcss(processors),
        purgecss({
            content: ['./**/*.hbs'],
            whitelistPatterns: [/data-theme*/, /post-date*/, /gh-*/, /kg-*/, /toc*/, /is-active*/, /pages-1*/, /member-form*/, /active*/, /form\[data-members-form\]*/]
        }),
        dest('assets/built/', { sourcemaps: '.' }),
        livereload()
    ], handleError(done));
}

function js(done) {
    pump([
        src('assets/js/*.js', { sourcemaps: true }),
        uglify(),
        dest('assets/built/', { sourcemaps: '.' }),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    var targetDir = './';
    var package = require('./package.json');
    var themeName = package.name;
    var filename = themeName + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**'
        ]),
        zip(filename),
        dest(targetDir)
    ], handleError(done));
}

const cssWatcher = () => watch('assets/css/**', css);
const hbsWatcher = () => watch(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs'], hbs);
const jsWatcher = () => watch('assets/js/**', js);
const watcher = parallel(cssWatcher, hbsWatcher, jsWatcher);

const build = series(css, js);
const dev = series(build, serve, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;