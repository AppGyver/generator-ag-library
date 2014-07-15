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
      cb(new Error("Command " + cmd + " failed: " + error.message));
    }
    cb(null, (stdout || '').replace(/^\s+|\s+$/g, ''));
  });
}

AgGenerator.prototype.fetchGitUserName = function fetchGitUserName() {
  var done = this.async();

  readLine('git config user.name', function(err, name) {
    if (err) {
      name = 'anonymous';
    }
    this.gitUserName = name;
    done();
  }.bind(this));
};

AgGenerator.prototype.fetchGitEmail = function fetchGitEmail() {
  var done = this.async();

  readLine('git config user.email', function(err, email) {
    if (err) {
      email = 'anon@example.com';
    }
    this.gitUserEmail = email;
    done();
  }.bind(this));
};

AgGenerator.prototype.fetchProjectGithubOrg = function fetchGitEmail() {
  var done = this.async();

  readLine('git remote -v | grep origin | tail -n 1 | cut -d: -f2 | cut -d/ -f1', function(err, org) {
    if (err || !org.length) {
      org = 'AppGyver';
    }
    this.githubProjectOrg = org;
    done();
  }.bind(this));
};

AgGenerator.prototype.promptName = function promptName() {
  var done = this.async();

  this.prompt([
    {
      type: 'input',
      name: 'project',
      message: 'github project name',
      default: this.appname
    },
    {
      type: 'input',
      name: 'organization',
      message: 'github organization name',
      default: this.githubProjectOrg
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
  answers.main = answers.project.replace('-', '/');
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
  this.copy('travis.yml', '.travis.yml');
  this.copy('coffeelint.json', 'coffeelint.json');
  this.copy('env.json', 'env.json');
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
    "load-grunt-tasks",
    "grunt-env"
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
