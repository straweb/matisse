module.exports = function (grunt) {
    'use strict';
    grunt.log.writeln('Running grunt on matisse');
    grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
        app: {
			lessSrc: './client/less',
			bootstrapSrc: './client/public/lib/bootstrap/css/',
			cssDest: './client/public/css'
		},
		recess: {
			options: {
            	compile: true
	        },
		    dist: {
				files: {
		            '<%= app.cssDest %>/matisse.css': [
    	    			'<%= app.lessSrc %>/*.less'/*,
						'<%= app.bootstrapSrc %>/bootstrap.css',
						'<%= app.bootstrapSrc %>/bootstrap-responsive.css'*/
        			]
        		}
    		}
		},
		copy: {
            css: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= app.src %>',
                        src: ['**/*.css'],
                        dest: '<%= app.dist %>'
                    }
                ]
            }
        },
        clean: {
            all: [
                'build/*'
            ],
            exclude: [

            ]
        },
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
        },
		watch: {
            styles: {
                files: '<%= app.lessSrc %>/*.less',
                tasks: ['recess']
            }
        },
    });


	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	//Todo: To revisit
	grunt.registerTask('default', ['jslint', 'uglify', 'jsdoc']);

	grunt.registerTask('build', [
        'clean',
        'recess'
    ]);
	grunt.registerTask('dev', ['build', 'watch']);
};
