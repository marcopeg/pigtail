import { createPigtailClient } from '../lib/index'
import { flush } from '../lib/flush'

jest.mock('../lib/flush')

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



    describe('chunking', () => {
        test('it should generate a new chunk based on data size', () => {
            const client = createPigtailClient({ target: 'xxx', maxChunkSize: 200 })
            client.log('foo')
            client.log('faa')

            expect(client.getState().data.logs.length).toBe(1)
            expect(client.getState().data.chunks.length).toBe(1)
        })

        test('it should generate a new chunk based on time limit', () => {
            const client = createPigtailClient({ target: 'xxx' })
            client.log('foo')
            client.createChunk()
            client.log('faa')

            expect(client.getState().data.logs.length).toBe(1)
            expect(client.getState().data.chunks.length).toBe(1)
        })

        test('it should not generate time based empty chunks', () => {
            jest.useFakeTimers()
            const client = createPigtailClient({ target: 'xxx' })
            client.createChunk()
            client.createChunk()
            client.createChunk()

            expect(client.getState().data.logs.length).toBe(0)
            expect(client.getState().data.chunks.length).toBe(0)
        })
    })



    describe('flushing', () => {
        test('it should flush chunks as soon as possible', async () => {
            const client = createPigtailClient({ target: 'xxx', maxChunkSize: 200 })
            client.log('foo')
            client.trackMetric('total', 22)
            client.pushEvent('login', { a: 1 })
            client.createChunk()

            // chunk size before flushing
            expect(client.getState().data.chunks.length).toBe(3)

            await client.flushChunk()
            await client.flushChunk()
            await client.flushChunk()
            await client.flushChunk()
            
            // flush callbacks and chunk size after flushing
            expect(flush.mock.calls.length).toBe(3)
            expect(client.getState().data.chunks.length).toBe(0)

            // expect to have a correct data balance
            expect(client.getState().data.currentSize).toBe(0)
            expect(client.getState().data.totalSize).toBe(0)
            expect(client.getState().data.chunksSize).toBe(0)
        })
    })
})
