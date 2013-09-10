/**
 * basic code for testing if qunit works
 *
 * This is from https://github.com/gruntjs/grunt-contrib-qunit/blob/master/test/qunit_test.js
 * I will be removed as soon as qunit is up and running and we start implementing our own tests.
 */

test('basic test', function() {
  expect(1);
  ok(true, 'this had better work.');
});


test('can access the DOM', function() {
  expect(1);
  var fixture = document.getElementById('qunit-fixture');
  equal(fixture.innerText, 'this had better work.', 'should be able to access the DOM.');
});
