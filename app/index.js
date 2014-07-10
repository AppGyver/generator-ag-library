'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var exec = require('child_process').exec;


var AgGenerator = module.exports = function AgGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({
      skipInstall: options['skip-install'],
      bower: false
    });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AgGenerator, yeoman.generators.Base);

function readLine(cmd, cb) {
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      throw error;
    }
    cb(stdout.replace(/^\s+|\s+$/g, ''));
  });
}

AgGenerator.prototype.fetchGitUserName = function fetchGitUserName() {
  var done = this.async();

  readLine('git config user.name', function(name) {
    this.gitUserName = name;
    done();
  }.bind(this));
};

AgGenerator.prototype.fetchGitEmail = function fetchGitEmail() {
  var done = this.async();

  readLine('git config user.email', function(email) {
    this.gitUserEmail = email;
    done();
  }.bind(this));
};

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
      message: 'library description',
      default: this.appname + ' npm library'
    },
    {
      type: 'input',
      name: 'author',
      message: 'library author',
      default: this.gitUserName + ' <' + this.gitUserEmail + '>'
    }
  ], function (answers) {
    this.libraryDescription = createLibraryDescription(answers);
    done();
  }.bind(this));
};

function createLibraryDescription(answers) {
  answers.main = answers.name.replace('-', '/');
  return answers;
};

AgGenerator.prototype.app = function app() {
  this.mkdir('src');
  this.copy('main.coffee', 'src/' + this.libraryDescription.main + '.coffee');
};

AgGenerator.prototype.projectfiles = function projectfiles() {
  this.template('_package.json', 'package.json', this.libraryDescription);
  this.template('_README.md', 'README.md', this.libraryDescription);

  this.copy('gitignore', '.gitignore');
  this.copy('coffeelint.json', 'coffeelint.json');
  this.copy('LICENSE', 'LICENSE');
};

AgGenerator.prototype.setupGruntFlow = function setupGruntFlow() {
  var done = this.async();

  this.copy('Gruntfile.coffee', 'Gruntfile.coffee');
  this.directory('tasks', 'tasks');

  this.npmInstall([
    "grunt",
    "grunt-coffeelint",
    "grunt-contrib-clean",
    "grunt-contrib-coffee",
    "grunt-contrib-watch",
    "load-grunt-config",
    "load-grunt-tasks"
  ], { 'saveDev': true }, done);
};

AgGenerator.prototype.setupTestFlow = function setupTestFlow() {
  var done = this.async();

  this.template('test/_SmokeTestSpec.coffee', 'test/SmokeTestSpec.coffee', this.libraryDescription);

  this.npmInstall([
    "chai",
    "grunt-mocha-test"
  ], { 'saveDev': true }, done);
};
