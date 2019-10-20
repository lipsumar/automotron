/* global describe,test,expect */
const { parse, _parseParts, _getAgreement } = require('./agreementUtils');

describe('Agreement utils', () => {
  describe('parse', () => {
      test.each([
        ['navet(ms)', {ms:'navet'}, {m:true, f:false, s:true, p:false}]
      ])('%s', (str, expectedValues, expectedAgreement) => {
        const {values, agreement} = parse(str)
        //expect(values).toEqual(expectedValues)
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
      ['s', {m: true, f: true, s: true, p: false}],
      ['p', {m: true, f: true, s: false, p: true}],
      ['f', {m: false, f: true, s: true, p: true}],
      ['m', {m: true, f: false, s: true, p: true}],
    ])('%s', (rawFlags, expectedAgreement) => {
      expect(
        _getAgreement(rawFlags)
      ).toEqual(expectedAgreement)
    })
  })
})