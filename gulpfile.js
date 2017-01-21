"use strict";

var browserify = require("browserify");
var del = require("del");
var gulp = require("gulp");
var gulpConcatCss = require("gulp-concat-css");
var runSequence = require("run-sequence");
var vinylSourceStream = require("vinyl-source-stream");

gulp.task("delete", function() {
	del.sync("./dist");
});

gulp.task("css", function() {
	return gulp.src([
		"./src/css/reset.css",
		"./src/css/hatetris.css"
	])
		.pipe(gulpConcatCss("bundle.css"))
		.pipe(gulp.dest("./dist/css"));
});

gulp.task("img", function() {
	return gulp.src([
		"./src/img/favicon.ico"
	])
		.pipe(gulp.dest("./dist/img"));
});

gulp.task("js", function() {
	return browserify([
		"./src/js/hatetris.js",
		"./src/js/statcounter.js"
	]).bundle()
		.pipe(vinylSourceStream("bundle.js"))
		.pipe(gulp.dest("./dist/js"));
});

gulp.task("html", function() {
	return gulp.src([
		"./src/hatetris.html"
	])
		.pipe(gulp.dest("./dist"));
});

gulp.task("build", function(cb) {
	runSequence("delete", "css", "img", "js", "html", cb);
});

gulp.task("default", ["build"], function() {
	gulp.watch("./src/**/*.*", ["build"]);
});
