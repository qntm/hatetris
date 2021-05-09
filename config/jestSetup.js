const Enzyme = require('enzyme')
const EnzymeAdapterReact16 = require('enzyme-adapter-react-16')

Enzyme.configure({ adapter: new EnzymeAdapterReact16() })

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
