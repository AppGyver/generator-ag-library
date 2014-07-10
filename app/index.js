'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var AgGenerator = module.exports = function AgGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AgGenerator, yeoman.generators.Base);

AgGenerator.prototype.promptName = function promptName() {
  var done = this.async();

  this.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'library name (same as github repository name)',
      default: this.appname
    },
    {
      type: 'input',
      name: 'description',
      message: 'library description'
    },
    {
      type: 'input',
      name: 'author',
      message: 'library author'
    }
  ], function (answers) {
    this.libraryDescription = answers
    done();
  }.bind(this));
};

AgGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/templates');

  this.template('_package.json', 'package.json', this.libraryDescription);
  this.template('_README.md', 'README.md', this.libraryDescription);
};

AgGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('Gruntfile.coffee', 'Gruntfile.coffee');
  this.copy('coffeelint.json', 'coffeelint.json');
  this.copy('LICENSE', 'LICENSE');
};
