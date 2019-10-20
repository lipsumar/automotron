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
  return {agreement}
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
function _getAgreement(rawFlags){
  const flags = rawFlags.split('')
  const agreement = {m:false, f:false, s:false, p:false}

  flags.forEach(flag => {
    if(flag === '*') return
    agreement[flag] = true
  })

  if(flags.length === 1){
    if(flags[0] === 's' || flags[0] === 'p'){
      agreement.m = true
      agreement.f = true
    }
    if(flags[0] === 'm' || flags[0] === 'f'){
      agreement.s = true
      agreement.p = true
    }
  }

  if(flags[0] === '*'){
    agreement.m = true
    agreement.f = true
  }

  if(flags[1] === '*'){
    agreement.s = true
    agreement.p = true
  }

  return agreement
}

function _getValues(rawValues, agreement){
  const possibleValues = rawValues.split(',').map(v => v.trim())
  const values = {}
  
  return values
}

module.exports = {
  parse,

  // only exported for testing
  _parseParts,
  _getAgreement
}