import { typedefGen } from '../lib'

describe('Test', () => {
  it('output file', () => {
    typedefGen({
      name: 'takashi',
      id: 1,
      hasMoney: true,
      hoge: {
        id: 1,
        test: 'test',
      },
    })
    expect('test').toBe('test')
  })
})
