module.exports = function (grunt) {
    'use strict';
    grunt.log.writeln('Running grunt on matisse');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.registerTask('default', ['jslint', 'uglify', 'jsdoc']);
    grunt.initConfig({
        clean: {
            all: [
                'build/*'
            ],
            exclude: [

            ]
        },
        pkg: grunt.file.readJSON('package.json'),
        jslint: {
            files: [
                'client/public/scripts/*.js',
                'app.js',
                'Gruntfile.js'
            ],
            exclude: [

            ],
            directives: {
                browser: true,
                unparam: true,
                todo: true,
                white: true,
                predef: [ // array of pre-defined globals
                    'angular',
                    'module',
                    'require'
                ]
            },
            options: {
                junit: 'out/junit.xml', // write the output to a JUnit XML
                log: 'out/lint.log',
                jslintXml: 'out/jslint_xml.xml',
                errorsOnly: true, // only display errors
                failOnError: true, // defaults to true
                shebang: true, // ignore shebang lines
                checkstyle: 'out/checkstyle.xml' // write a checkstyle-XML
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'client/public/scripts/*.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        jsdoc : {
            dist : {
                src: ['client/public/scripts/*.js'],
                options: {
                    destination: 'build/docs'
                }
            }
        }
    });

    grunt.registerMultiTask('clean', function () {
        this.filesSrc.forEach(function (filepath) {
            console.log('delete', filepath);
        });
    });
};