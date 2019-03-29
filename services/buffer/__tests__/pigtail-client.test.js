import { createPigtailClient } from '../lib/index'

describe('PigtailClient', () => {

    test('it should create a client instance', () => {
        const client = createPigtailClient({ target: 'xxx' })
        expect(client).toHaveProperty('log')
        expect(client).toHaveProperty('trackMetric')
        expect(client).toHaveProperty('pushEvent')
    })

    test('it should accept a log', () => {
        const client = createPigtailClient({ target: 'xxx' })
        client.log('foo')
        expect(client.getState().data.logs.length).toBe(1)
    })

    test('it should generate a new chunk based on data size', () => {
        const client = createPigtailClient({ target: 'xxx', maxChunkSize: 200 })
        client.log('foo')
        client.log('faa')

        expect(client.getState().data.logs.length).toBe(1)
        expect(client.getState().data.chunks.length).toBe(1)
    })

    test('it should generate a new chunk based on time limit', () => {
        jest.useFakeTimers()
        const client = createPigtailClient({ target: 'xxx' })
        client.log('foo')
        jest.runOnlyPendingTimers()
        client.log('faa')

        expect(client.getState().data.logs.length).toBe(1)
        expect(client.getState().data.chunks.length).toBe(1)
    })

    test('it should not generate time based empty chunks', () => {
        jest.useFakeTimers()
        const client = createPigtailClient({ target: 'xxx' })
        jest.runOnlyPendingTimers()
        jest.runOnlyPendingTimers()
        jest.runOnlyPendingTimers()

        expect(client.getState().data.logs.length).toBe(0)
        expect(client.getState().data.chunks.length).toBe(0)
    })
})
