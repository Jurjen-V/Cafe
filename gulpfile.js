const gulp         = require("gulp"),
    autoprefixer = require("gulp-autoprefixer"),
    browserSync  = require("browser-sync").create(),
    // reload       = browserSync.reload,
    sass         = require("gulp-sass"),
    cleanCSS     = require("gulp-clean-css"),
    sourcemaps   = require("gulp-sourcemaps"),
    concat       = require("gulp-concat"),
    imagemin     = require("gulp-imagemin"),
    changed      = require("gulp-changed"),
    uglify       = require("gulp-uglify"),
    eslint       = require("gulp-eslint"),
    lineec       = require("gulp-line-ending-corrector");


// Watch Files
const htmlWatchFiles  = "./**/*.html",
    styleWatchFiles = "./src/scss/**/*.scss";
const imgSRC          = "./src/images/*";

// Used to concat the files in a specific order.
const js    = "./src/js/";
const jsSRC = [
    js + "/vendor/" + "ScrollMagic.min.js",
    js + "/vendor/" + "debug.addIndicators.min.js",
    js + "script.js"
];

// Used to concat the files in a specific order.
const cssVendorSRC = [
    "./src/css/bootstrap/bootstrap.css",
    "./src/css/bootstrap/bootstrap-grid.css",
    "./src/css/bootstrap/bootstrap-reboot.css",
];

// Distribution folders
const jsDist  = "./dist/js/",
    cssDist = "./dist/css/",
    imgDist = "./dist/images/";

function compileSCSS() {
    return gulp
        .src(["./src/scss/style.scss"])
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(
            sass({
                outputStyle: "expanded"
            }).on("error", sass.logError)
        )
        .pipe(autoprefixer("last 2 versions"))
        .pipe(sourcemaps.write("./maps/"))
        .pipe(lineec())
        .pipe(gulp.dest(cssDist));
}

function concatCSS() {
    return gulp
        .src(cssVendorSRC)
        .pipe(sourcemaps.init({loadMaps: true, largeFile: true}))
        .pipe(concat("vendor.min.css"))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write("./maps/"))
        .pipe(lineec())
        .pipe(gulp.dest(cssDist));
}

function jsLint() {
    return gulp
        .src(js + "script.js")
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function jsConcat() {
    return gulp
        .src(jsSRC)
        .pipe(concat("script.js"))
        .pipe(uglify())
        .pipe(lineec())
        .pipe(gulp.dest(jsDist));
}

function imgmin() {
    return gulp
        .src(imgSRC)
        .pipe(changed(imgDist))
        .pipe(
            imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.jpegtran({progressive: true}),
                imagemin.optipng({optimizationLevel: 5})
            ])
        )
        .pipe(gulp.dest(imgDist));
}

function watch() {

    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch(styleWatchFiles, compileSCSS);
    gulp.watch(cssVendorSRC, concatCSS);
    gulp.watch(js + "script.js", gulp.series([jsLint, jsConcat]));
    gulp.watch(jsSRC, jsConcat);
    gulp.watch(imgSRC, imgmin);
    gulp
        .watch([htmlWatchFiles, jsDist + "script.js", cssDist + "style.css"])
        .on("change", browserSync.reload);
}

exports.compileSCSS = compileSCSS;
exports.concatCSS   = concatCSS;
exports.jsLint      = jsLint;
exports.jsConcat    = jsConcat;
exports.watch       = watch;
exports.imgmin      = imgmin;


// TODO: make starter "build" function + Readme?

const build = gulp.parallel(watch);
gulp.task("default", build);
