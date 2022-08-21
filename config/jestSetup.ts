import '@testing-library/jest-dom'

// Need for clipboard testing
navigator.clipboard = {
  writeText (text) {
    this.text = text
    return Promise.resolve()
  },
  readText () {
    return Promise.resolve(this.text)
  }
}
