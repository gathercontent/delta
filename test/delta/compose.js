var Delta = require('../../lib/delta');


describe('compose()', function () {
  it('insert + insert', function () {
    var a = new Delta().insert('A');
    var b = new Delta().insert('B');
    var expected = new Delta().insert('B').insert('A');
    expect(a.compose(b)).toEqual(expected);
  });

  it('insert + retain', function () {
    var a = new Delta().insert('A');
    var b = new Delta().retain(1, { bold: true, color: 'red', font: null });
    var expected = new Delta().insert('A', { bold: true, color: 'red' });
    expect(a.compose(b)).toEqual(expected);
  });

  it('insert + delete', function () {
    var a = new Delta().insert('A');
    var b = new Delta().delete(1);
    var expected = new Delta();
    expect(a.compose(b)).toEqual(expected);
  });

  it('delete + insert', function () {
    var a = new Delta().delete(1);
    var b = new Delta().insert('B');
    var expected = new Delta().insert('B').delete(1);
    expect(a.compose(b)).toEqual(expected);
  });

  it('delete + retain', function () {
    var a = new Delta().delete(1);
    var b = new Delta().retain(1, { bold: true, color: 'red' });
    var expected = new Delta().delete(1).retain(1, { bold: true, color: 'red' });
    expect(a.compose(b)).toEqual(expected);
  });

  it('delete + delete', function () {
    var a = new Delta().delete(1);
    var b = new Delta().delete(1);
    var expected = new Delta().delete(2);
    expect(a.compose(b)).toEqual(expected);
  });

  it('delete + delete attributes', function () {
    var a = new Delta().delete(1);
    var b = new Delta().push({delete: 1, attributes: { who: 1}});
    var expected = new Delta().delete(1).push({delete:1 , attributes: { who: 1}});
    expect(a.compose(b)).toEqual(expected);
  });

  it('retain + insert', function () {
    var a = new Delta().retain(1, { color: 'blue' });
    var b = new Delta().insert('B');
    var expected = new Delta().insert('B').retain(1, { color: 'blue' });
    expect(a.compose(b)).toEqual(expected);
  });

  it('retain + retain', function () {
    var a = new Delta().retain(1, { color: 'blue' });
    var b = new Delta().retain(1, { bold: true, color: 'red', font: null });
    var expected = new Delta().retain(1, { bold: true, color: 'red', font: null });
    expect(a.compose(b)).toEqual(expected);
  });

  it('retain + delete', function () {
    var a = new Delta().retain(1, { color: 'blue' });
    var b = new Delta().delete(1);
    var expected = new Delta().delete(1);
    expect(a.compose(b)).toEqual(expected);
  });

  it('insert in middle of text', function () {
    var a = new Delta().insert('Hello');
    var b = new Delta().retain(3).insert('X');
    var expected = new Delta().insert('HelXlo');
    expect(a.compose(b)).toEqual(expected);
  });

  it('insert and delete ordering', function () {
    var a = new Delta().insert('Hello');
    var b = new Delta().insert('Hello');
    var insertFirst = new Delta().retain(3).insert('X').delete(1);
    var deleteFirst = new Delta().retain(3).delete(1).insert('X');
    var expected = new Delta().insert('HelXo');
    expect(a.compose(insertFirst)).toEqual(expected);
    expect(b.compose(deleteFirst)).toEqual(expected);
  });

  it('insert embed', function () {
    var a = new Delta().insert(1, { src: 'http://quilljs.com/image.png' });
    var b = new Delta().retain(1, { alt: 'logo' });
    var expected = new Delta().insert(1, { src: 'http://quilljs.com/image.png', alt: 'logo' });
    expect(a.compose(b)).toEqual(expected);
  });

  it('delete entire text', function () {
    var a = new Delta().retain(4).insert('Hello');
    var b = new Delta().delete(9);
    var expected = new Delta().delete(4);
    expect(a.compose(b)).toEqual(expected);
  });

  it('retain more than length of text', function () {
    var a = new Delta().insert('Hello');
    var b = new Delta().retain(10);
    var expected = new Delta().insert('Hello');
    expect(a.compose(b)).toEqual(expected);
  });

  it('retain empty embed', function () {
    var a = new Delta().insert(1);
    var b = new Delta().retain(1);
    var expected = new Delta().insert(1);
    expect(a.compose(b)).toEqual(expected);
  });

  it('remove all attributes', function () {
    var a = new Delta().insert('A', { bold: true });
    var b = new Delta().retain(1, { bold: null });
    var expected = new Delta().insert('A');
    expect(a.compose(b)).toEqual(expected);
  });

  it('remove all embed attributes', function () {
    var a = new Delta().insert(2, { bold: true });
    var b = new Delta().retain(1, { bold: null });
    var expected = new Delta().insert(2);
    expect(a.compose(b)).toEqual(expected);
  });

  it('immutability', function () {
    var attr1 = { bold: true };
    var attr2 = { bold: true };
    var a1 = new Delta().insert('Test', attr1);
    var a2 = new Delta().insert('Test', attr1);
    var b1 = new Delta().retain(1, { color: 'red' }).delete(2);
    var b2 = new Delta().retain(1, { color: 'red' }).delete(2);
    var expected = new Delta().insert('T', { color: 'red', bold: true }).insert('t', attr1);
    expect(a1.compose(b1)).toEqual(expected);
    expect(a1).toEqual(a2);
    expect(b1).toEqual(b2);
    expect(attr1).toEqual(attr2);
  });
});
