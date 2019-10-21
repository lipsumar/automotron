/* global describe,test,expect */
const {
  parse,
  _parseParts,
  _getAgreement,
  _getValues
} = require('./agreementUtils');

describe('Agreement utils', () => {
  describe('parse', () => {
    test.each([
      ['navet(ms)', { ms: 'navet' }, { m: true, f: false, s: true, p: false }],
      ['[un, une](s)', { ms: 'un', fs: 'une' }, { m: true, f: true, s: true, p: false }],
      ['[un, une](*s)', { ms: 'un', fs: 'une' }, { m: true, f: true, s: true, p: false }], // weird notation, but valid
      ['des(p)', { mp: 'des', fp: 'des' }, { m: true, f: true, s: false, p: true }],
      ['un mot(ms)', { ms: 'un mot' }, { m: true, f: false, s: true, p: false }],
      ['des mots(mp)', { mp: 'des mots' }, { m: true, f: false, s: false, p: true }],
      ['deux(*p)', { mp: 'deux', fp: 'deux' }, { m: true, f: true, s: false, p: true }],
      ['repas(m*)', { ms: 'repas', mp: 'repas' }, { m: true, f: false, s: true, p: true }],
      ['[mot, mots](m)', { ms: 'mot', mp: 'mots' }, { m: true, f: false, s: true, p: true }],
      ['[beau, belle](s)', { ms: 'beau', fs: 'belle' }, { m: true, f: true, s: true, p: false }],
      //['pomme', {}]
    ])('%s', (str, expectedValues, expectedAgreement) => {
      const { values, agreement } = parse(str)
      expect(values).toEqual(expectedValues)
      expect(agreement).toEqual(expectedAgreement)
    })

  })

  describe('_parseParts', () => {
    test.each([
      ['un mot(ms)', 'un mot', 'ms'],
      ['des mots(mp)', 'des mots', 'mp'],
      ['deux(*p)', 'deux', '*p'],
      ['repas(m*)', 'repas', 'm*'],
      ['[mot, mots](m)', 'mot, mots', 'm'],
      ['[beau, belle](s)', 'beau, belle', 's']
    ])('%s', (str, expectedValues, expectedRawFlags) => {
      const { rawValues, rawFlags } = _parseParts(str)
      expect(rawValues).toBe(expectedValues)
      expect(rawFlags).toBe(expectedRawFlags)
    })
  })

  describe('_getAgreement', () => {
    test.each([
      ['ms', { m: true, f: false, s: true, p: false }],
      ['fs', { m: false, f: true, s: true, p: false }],
      ['mp', { m: true, f: false, s: false, p: true }],
      ['fp', { m: false, f: true, s: false, p: true }],
      ['m', { m: true, f: false, s: true, p: true }],
      ['f', { m: false, f: true, s: true, p: true }],
      ['s', { m: true, f: true, s: true, p: false }],
      ['p', { m: true, f: true, s: false, p: true }],

      ['m*', { m: true, f: false, s: true, p: true }],
      ['*p', { m: true, f: true, s: false, p: true }]
    ])('%s', (rawFlags, expectedAgreement) => {
      expect(
        _getAgreement(rawFlags)
      ).toEqual(expectedAgreement)
    })
  })

  describe('_getValues', () => {
    test.each([
      ['mot', { m: true, f: false, s: true, p: false }, { ms: 'mot' }],
      ['mots', { m: true, f: false, s: false, p: true }, { mp: 'mots' }],
      ['mot, mots', { m: true, f: false, s: true, p: true }, { ms: 'mot', mp: 'mots' }],
      ['beau, belle', { m: true, f: true, s: true, p: false }, { ms: 'beau', fs: 'belle' }],
      ['beau, belle, beaux, belles', { m: true, f: true, s: true, p: true }, { ms: 'beau', fs: 'belle', mp: 'beaux', fp: 'belles' }],
      ['deux', { m: true, f: true, s: false, p: true }, { mp: 'deux', fp: 'deux' }],
    ])('%s %p', (str, agreement, expectedValues) => {
      expect(
        _getValues(str, agreement)
      ).toEqual(expectedValues)
    })
  })
})