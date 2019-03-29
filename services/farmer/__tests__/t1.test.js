import * as foo from '../lib/index'

describe('t1', () => {
    it('should work', async () => {
        const r = await foo.foo123()
        expect(r).toBe('xxx')
    })
})
