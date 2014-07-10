require('chai').should()

describe "<%= name %>", ->
  it "should be an object", ->
    require('../src/<%= main %>').should.be.an.object