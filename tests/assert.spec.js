describe('assert', function () {

  var self = window.m;

  it('should check string', function () {
    expect(self.check("", String)).toBeTruthy();
    expect(self.check("", Number)).toBeFalsy();
    expect(self.check("", Object)).toBeFalsy();
    expect(self.check("", {})).toBeFalsy();
    expect(self.check("", Function)).toBeFalsy();
  });

  it('should check number', function () {
    expect(self.check(0, Number)).toBeTruthy();
    expect(self.check(-1, Number)).toBeTruthy();
    expect(self.check(0, String)).toBeFalsy();
    expect(self.check(0, Object)).toBeFalsy();
    expect(self.check(1, {})).toBeFalsy();
    expect(self.check(1, Function)).toBeFalsy();
  });

  it('should check object', function () {
    expect(self.check({ id: "", num: 0 }, { id: String, num: Number })).toBeTruthy();
    expect(self.check({ id: "", num: 0 }, Object)).toBeTruthy();
    expect(self.check({ id: "", num: "" }, { id: String, num: Number })).toBeFalsy();
    expect(self.check({ id: "" }, { id: String, num: Number })).toBeFalsy();
    expect(self.check({ id: 0, num: 0 }, { id: String, num: Number })).toBeFalsy();
  });

  it('should check object', function () {
    expect(self.check({ id: "", num: 0 }, { id: String, num: Number })).toBeTruthy();
    expect(self.check({ id: "", num: 0 }, Object)).toBeTruthy();
    expect(self.check({ id: "", num: "" }, { id: String, num: Number })).toBeFalsy();
    expect(self.check({ id: "" }, { id: String, num: Number })).toBeFalsy();
    expect(self.check({ id: 0, num: 0 }, { id: String, num: Number })).toBeFalsy();
  });

  it('should check function', function () {
    expect(self.check(function () { }, Function)).toBeTruthy();
    expect(self.check(function () { }, Object)).toBeFalsy();
    expect(self.check(function () { }, {})).toBeFalsy();
  });

  it('should check array', function () {
    expect(self.check([], Array)).toBeTruthy();
    expect(self.check([], Object)).toBeFalsy();
    expect(self.check([], Number)).toBeFalsy();
    expect(self.check([], String)).toBeFalsy();
    expect(self.check([], {})).toBeFalsy();
  });
});
