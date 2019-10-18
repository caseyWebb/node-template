import {
  equals,
  instanceOf,
  isLength,
  isEmpty,
  isType,
  isDate,
  isNull,
  isNumber,
  isInteger,
  isUndefined,
  divisibleBy,
  max,
  min,
  maxLength,
  minLength,
  pattern,
  email,
  required
} from '../src'

describe('validators', () => {
  test('equals', () => {
    const isFoo = equals('foo')
    expect(isFoo('foo').isValid).toBe(true)
    expect(isFoo('bar').isValid).toBe(false)
  })

  test('instanceOf', () => {
    class Foo {}
    const foo = new Foo()
    const isFoo = instanceOf(Foo)
    expect(isFoo(foo).isValid).toBe(true)
    expect(isFoo('bar').isValid).toBe(false)
  })

  test('isLength', () => {
    const is3Long = isLength(3)
    expect(is3Long('foo').isValid).toBe(true)
    expect(is3Long('foobar').isValid).toBe(false)
    expect(is3Long([1, 2, 3]).isValid).toBe(true)
    expect(is3Long([1]).isValid).toBe(false)
  })

  test('isEmpty', () => {
    expect(isEmpty()('').isValid).toBe(true)
    expect(isEmpty()('foo').isValid).toBe(false)
    expect(isEmpty()([]).isValid).toBe(true)
    expect(isEmpty()(['foo']).isValid).toBe(false)
    expect(isEmpty()(null).isValid).toBe(true)
    expect(isEmpty()(undefined).isValid).toBe(true)
  })
})
