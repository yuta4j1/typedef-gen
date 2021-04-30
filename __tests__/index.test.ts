import { run } from '../src/index'

describe('Test', () => {
  it('output file', () => {
    run({
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
