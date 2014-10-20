require('chai').should()

describe "<%= project %> root", ->
  it "should be defined", ->
    require('../src').should.exist