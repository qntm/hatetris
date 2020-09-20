const Enzyme = require('enzyme')
const EnzymeAdapterReact16 = require('enzyme-adapter-react-16')

Enzyme.configure({ adapter: new EnzymeAdapterReact16() })
