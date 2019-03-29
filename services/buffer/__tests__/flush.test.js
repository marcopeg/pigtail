global.fetch = require('jest-fetch-mock')
import { flush } from '../lib/flush'

describe('flush', () => {
    test('it should put together a decent request', async () => {
        fetch.mockResponseOnce(JSON.stringify({
            data: {
                api: {
                    trackMetrics: true,
                }
            }
        }))

        const res = await flush({
            size: 100,
            attempts: 0,
            logs: [],
            metrics: [],
            events: [],
        }, {
            endpoint: 'http://localhost:8080/api/foo',
            token: 'token',
        })

        expect(res).toBe(true)
    })
})
