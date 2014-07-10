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

AgGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [{
    type: 'confirm',
    name: 'someOption',
    message: 'Would you like to enable this option?',
    default: true
  }];

  this.prompt(prompts, function (props) {
    this.someOption = props.someOption;

    cb();
  }.bind(this));
};

AgGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/templates');

  this.template('_package.json', 'package.json');
  this.template('_README.md', 'README.md');
};

AgGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('Gruntfile.coffee', 'Gruntfile.coffee');
  this.copy('coffeelint.json', 'coffeelint.json');
  this.copy('LICENSE', 'LICENSE');
};
