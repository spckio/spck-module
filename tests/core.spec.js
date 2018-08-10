describe('core', function () {

  var self = window.m;

  it('it should extend like overwrite', function () {
    expect(self.extend({ a: "1" }, { a: "2" })).toEqual({ a: "2" });
    expect(self.extend({ a: "1" }, { a: undefined })).toEqual({ a: "1" });
    expect(self.extend({ a: "1" }, { a: null })).toEqual({ a: null });
  });


  it('should load requests', function (done) {
    self.module('requests');
    self.initialize('requests').then(function () {
      done();
    });
  });


  it('should handle duplicate loading', function (done) {
    var initCount = 0;
    self.module('dup1').__init__(function () {
      initCount++;
    });
    self.initialize('dup1').then(function () {
      // This was called first, will initiate actual loading.
      initCount++;
      expect(initCount).toBe(3);
      done();
    });
    self.initialize('dup1').then(function () {
      initCount++;
    });
  });


  it('should handle aliasing', function () {
    self.alias('http://bull.js', 'cow.js');
    self.import('http://bull.js');
    expect(document.head.getElementsByTagName('script')[0].getAttribute('src')).toBe('cow.js');
  });


  it('should handle circular dependencies', function (done) {
    self.module('chicken')
      .require('egg');

    self.module('egg')
      .require('chicken');

    self.initialize('chicken')
      .catch(function (e) {
        expect(e.message).toBe('Circular dependency "chicken" found for module "egg".');
        done();
      });
  });

  it('should handle 3 circular dependencies', function (done) {
    self.module('mom')
      .require('baby');

    self.module('dad')
      .require('mom');

    self.module('baby')
      .require('mom')
      .require('dad');

    self.initialize('dad')
      .catch(function (e) {
        expect(e.message).toBe('Circular dependency "mom" found for module "baby".');
        done();
      });
  });
});
