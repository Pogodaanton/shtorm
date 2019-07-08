class JSONChecker {
  /**
   * Checks whether string is a valid JSON-Object by returning a simple boolean value
   * @author Onur Yıldırım - https://stackoverflow.com/questions/9804777/how-to-test-if-a-string-is-json-or-not/31051118
   * @param {string} str String to be validated
   * @returns {boolean}
   */
  hasJsonStructure (str) {
    if (typeof str !== 'string') return false
    str = str.trim().replace(/\r?\n|\r/g, '')
    try {
      const result = JSON.parse(str)
      return Object.prototype.toString.call(result) === '[object Object]' ||
            Array.isArray(result)
    } catch (err) {
      return false
    }
  }

  /**
   * Parses a string to a JSON-Object without throwing errors
   * @author Onur Yıldırım - https://stackoverflow.com/questions/9804777/how-to-test-if-a-string-is-json-or-not/31051118
   * @param {string} str String to be parsed
   * @returns {array} [error, parsedJson]
   */
  safeJsonParse (str) {
    str = str.trim().replace(/\r?\n|\r/g, '')
    try {
      return [null, JSON.parse(str)]
    } catch (err) {
      return [err]
    }
  }

  /*

  Might become more complex later

  hasStringJson (string) {
    return this.hasJsonStructure(string)
  }

  parseToJson (string) {
    return [
      this.safeJsonParse(string)
    ]
  }
  */
}

export default new JSONChecker()
