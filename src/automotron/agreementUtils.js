const regexParts = /\[?(.*?)\]?\(([a-z\*]{1,2})\)$/

/**
 * This is the main public function to make
 * a full parse of a user input
 * @param {str} str 
 */
function parse(str) {
  const { rawValues, rawFlags } = _parseParts(str);
  const agreement = _getAgreement(rawFlags)
  const values = _getValues(rawValues, agreement)
  return { agreement, values }
}

/**
   * This function removes [] and ()
   * but only returns 2 strings: rawValues and rawFlags.
   * 
   * This method has no logic, it's only parsing the notation.
   * 
   * Ex:  mot(ms)         => "mot" & "ms"
   *      [mot, mots](f)  => "mot, mots" & "f"
   * @param {str} str 
   */
function _parseParts(str) {
  const m = regexParts.exec(str);
  return {
    rawValues: m[1],
    rawFlags: m[2]
  }
}

/**
 * Returns an agreement object
 * Ex: 'ms' => {m:true, f:false, s:true, p:false}
 * @param {str} rawFlags 
 */
function _getAgreement(rawFlags) {
  const flags = rawFlags.split('')
  const agreement = { m: false, f: false, s: false, p: false }

  flags.forEach(flag => {
    if (flag === '*') return
    agreement[flag] = true
  })

  if (flags.length === 1) {
    if (flags[0] === 's' || flags[0] === 'p') {
      agreement.m = true
      agreement.f = true
    }
    if (flags[0] === 'm' || flags[0] === 'f') {
      agreement.s = true
      agreement.p = true
    }
  }

  if (flags[0] === '*') {
    agreement.m = true
    agreement.f = true
  }

  if (flags[1] === '*') {
    agreement.s = true
    agreement.p = true
  }

  return agreement
}

function _getValues(rawValues, agreement) {
  const possibleValues = rawValues.split(',').map(v => v.trim())
  let values = {}

  if (possibleValues.length === 1) {
    if (agreement.m && agreement.f || agreement.s && agreement.p) {
      values = _getValuesForSameGenderOrNumber(
        [possibleValues[0], possibleValues[0]],
        agreement
      )
    } else {
      const gender = agreement.m ? 'm' : 'f'
      const number = agreement.s ? 's' : 'p'
      values[`${gender}${number}`] = possibleValues[0]
    }
  }

  if (possibleValues.length === 2) {
    values = _getValuesForSameGenderOrNumber(possibleValues, agreement)
  }

  if (possibleValues.length === 4) {
    values.ms = possibleValues[0]
    values.fs = possibleValues[1]
    values.mp = possibleValues[2]
    values.fp = possibleValues[3]
  }

  return values
}

function _getValuesForSameGenderOrNumber(possibleValues, agreement) {
  const values = {}
  // are the 2 values genders or numbers ?
  if (agreement.m && agreement.f) { // we have both genders, so it's gender
    const number = agreement.s ? 's' : 'p'
    values[`m${number}`] = possibleValues[0]
    values[`f${number}`] = possibleValues[1]
  } else { // number
    const gender = agreement.m ? 'm' : 'f'
    values[`${gender}s`] = possibleValues[0]
    values[`${gender}p`] = possibleValues[1]
  }
  return values
}

module.exports = {
  parse,

  // only exported for testing
  _parseParts,
  _getAgreement,
  _getValues
}