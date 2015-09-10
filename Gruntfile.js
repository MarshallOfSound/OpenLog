module.exports = function(grunt) {
    var fs = require('fs'),
        config = JSON.parse(fs.readFileSync('./config.inc.json'));

    grunt.initConfig({
        clean: {
            serverPublic: ['server/public']
        },
        concat: {
            server: {
                options: {
                    separator: ';\n'
                },
                src: ['server/dev_public/js/*.js'],
                dest: 'server/public/js/core.js'
            },
            libJS: {
                options: {
                    separator: ';\n'
                },
                src: ['server/dev_public/lib/js/*.js', '!server/dev_public/lib/js/0_*.js'],
                dest: 'server/public/js/lib.js'
            },
            libCSS: {
                src: ['server/dev_public/lib/css/*.css'],
                dest: 'server/public/css/lib.min.css'
            },
            libLicense: {
                src: ['server/dev_public/lib/js/0_licenses.js', 'server/public/js/lib.min.js'],
                dest: 'server/public/js/lib.min.js'
            }
        },
        copy: {
            fonts: {
                files: [
                    {
                        expand: true,
                        cwd: 'server/dev_public/lib/fonts',
                        src: ['*.*'],
                        dest: 'server/public/fonts/'
                    }
                ]
            }
        },
        cssmin: {
            lib: {
                options: {
                    keepSpecialComments: 0
                },
                files: {
                    'server/public/css/lib.min.css': ['server/public/css/lib.min.css']
                }
            }
        },
        less: {
            server: {
                options: {
                    compress: true
                },
                files: {
                    "server/public/css/core.min.css": "server/dev_public/less/core.less"
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    mangle: {
                        except: ['Log']
                    }
                },
                files: {
                    'dist/capture.min.js': ['dist/capture.js']
                }
            },
            server: {
                files: {
                    'server/public/js/core.min.js': ['server/public/js/core.js'],
                    'server/public/js/lib.min.js': ['server/public/js/lib.js']
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                forin: true,
                unused: true,
                noempty: true,
                latedef: true,
                globals: {
                    jQuery: true,
                    browser: true,
                    devel: true
                }
            },
            dist: {
                files: [
                    {
                        cwd: 'js',
                        src: '*.js',
                        expand: true
                    }
                ]
            },
            server: {
                files: [{
                    cwd: 'server/dev_public/js',
                    src: '*.js',
                    expand: true
                }],
                options: {
                    globals: {
                        jQuery: true
                    }
                }
            }
        },
        replace: {
            serverPort: {
                src: ['js/capture.js'],
                dest: 'dist/',
                replacements: [{
                    from: '{{SERVER_PORT}}',
                    to: config.server.port
                }]
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/*.spec.js']
            }
        },
        watch: {
            capture: {
                files: ['js/capture.js'],
                tasks: ['build-capture']
            },
            "server-js": {
                files: ['server/dev_public/*.*', 'server/dev_public/**/*.*', 'server/dev_public/*', 'server/dev_public/lib/*.js'],
                tasks: ['server-js-prod']
            },
            "server-css": {
                files: ['server/dev_public/less/*.less', 'server/dev_public/lib/*.css'],
                tasks: ['server-css']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('server-css', ['less', 'concat:libCSS', 'cssmin:lib', 'copy:fonts']);
    grunt.registerTask('server-js-prod', ['jshint:server', 'server-js', 'uglify:server', 'concat:libLicense']);
    grunt.registerTask('server-js', ['jshint:server', 'concat:server', 'concat:libJS']);
    grunt.registerTask('build-capture', ['jshint:dist', 'replace:serverPort', 'uglify:dist']);
    grunt.registerTask('build-server', ['server-css', 'server-js-prod']);
    grunt.registerTask('build', ['build-capture', 'clean:serverPublic', 'build-server']);

    grunt.registerTask('test', ['mochaTest']);
};