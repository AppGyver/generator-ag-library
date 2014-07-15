/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;


describe('ag-library generator', function () {
    this.timeout(10000);

    beforeEach(function (done) {
        helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
            if (err) {
                return done(err);
            }

            this.app = helpers.createGenerator('ag-library:app', [
                '../../app'
            ]);
            done();
        }.bind(this));
    });

    it('creates expected files', function (done) {
        var expected = [
            // add files you expect to exist here.
            'package.json',
            'README.md',
            'coffeelint.json',
            'env.json',
            '.gitignore',
            '.travis.yml',
            'Gruntfile.coffee',
            'LICENSE',
            'test/SmokeTestSpec.coffee'
        ];

        helpers.mockPrompt(this.app, {
            'project': 'mockApp',
            'organization': 'mockorg',
            'description': 'mock description',
            'author': 'anonymous'
        });
        this.app.options['skip-install'] = true;
        this.app.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });
    });
});
