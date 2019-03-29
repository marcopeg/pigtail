import { createPigtailClient } from '../lib/index'

describe('PigtailClient', () => {
    it('should create a client instance', () => {
        const client = createPigtailClient({ target: 'xxx' })
        expect(client).toHaveProperty('log')
        expect(client).toHaveProperty('trackMetric')
        expect(client).toHaveProperty('pushEvent')
    })
})
