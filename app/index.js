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

var fetchInto = function(property, command) {
  var defaults = {
    'gitUserName': 'anonymous',
    'gitUserEmail': 'anon@example.com',
    'githubProjectOrg': 'AppGyver'
  };

  function readLine(cmd, cb) {
    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        cb(new Error("Command " + cmd + " failed: " + error.message));
      }
      cb(null, (stdout || '').replace(/^\s+|\s+$/g, ''));
    });
  }

  return function() {
    var done = this.async();

    readLine(command, function(err, result) {
      if (err || !result.length) {
        result = defaults[property];
      }
      this[property] = result;
      done();
    }.bind(this));
  };
};

AgGenerator.prototype.fetchGitUserName = fetchInto(
  'gitUserName',
  'git config user.name'
);

AgGenerator.prototype.fetchGitEmail = fetchInto(
  'gitUserEmail',
  'git config user.email'
);

AgGenerator.prototype.fetchProjectGithubOrg = fetchInto(
  'githubProjectOrg',
  'git remote -v | grep origin | tail -n 1 | cut -d: -f2 | cut -d/ -f1'
);

AgGenerator.prototype.fetchProjectGithubRepo = fetchInto(
  'githubProjectRepo',
  'git remote -v | grep origin | tail -n 1 | cut -d: -f2 | cut -d/ -f2 | cut -d. -f1'
);


AgGenerator.prototype.promptProjectInformation = function promptProjectInformation() {
  var done = this.async();

  this.prompt([
    {
      type: 'input',
      name: 'project',
      message: 'github project name',
      default: this.githubProjectRepo || this.appname
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
      name: 'username',
      message: 'library author name',
      default: this.gitUserName
    },
    {
      type: 'input',
      name: 'email',
      message: 'library author email address',
      default: this.gitUserEmail
    }
  ], function (answers) {
    this.libraryDescription = createLibraryDescription(answers);
    done();
  }.bind(this));
};

function createLibraryDescription(answers) {
  answers.main = answers.project.replace(/-/g, '/');
  answers.author = answers.username + ' <' + answers.email + '>';
  return answers;
};

AgGenerator.prototype.app = function app() {
  this.mkdir('src');
  this.copy('main.coffee', 'src/' + this.libraryDescription.main + '.coffee');
};

AgGenerator.prototype.projectfiles = function projectfiles() {
  this.template('_package.json', 'package.json', this.libraryDescription);
  this.template('_README.md', 'README.md', this.libraryDescription);
  this.template('_travis.yml', '.travis.yml', this.libraryDescription);

  this.copy('gitignore', '.gitignore');
  this.copy('npmignore', '.npmignore');
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
    "grunt-mocha-cov",
    "coffee-script"
  ], { 'saveDev': true }, done);
};
