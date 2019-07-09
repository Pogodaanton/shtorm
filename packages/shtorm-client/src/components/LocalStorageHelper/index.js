/* global localStorage */
module.exports = {
  get: (key = 'shtormDefaults', toObject = false) => {
    const reqItem = localStorage.getItem(key)

    if (toObject) {
      try {
        const parsedItem = JSON.parse(reqItem)
        return parsedItem
      } catch (err) {
        console.log('An error happened while parsing localStorage item:', err)
      }
    }

    return reqItem
  },

  set: (key = 'shtormDefaults', value = {}) => {
    if (typeof value === 'object') value = JSON.stringify(value)
    if (typeof value !== 'string') value = value.toString()
    localStorage.setItem(key, value)
  }
}
