import { validateSettings } from './validate-settings'
import { createRecord, recordType } from './create-record'
import { flush } from './flush'

export const createPigtailClient = (receivedSettings) => {
    const settings = validateSettings(receivedSettings)
    const data = {
        // size counter
        currentSize: 0,
        totalSize: 0,
        chunksSize: 0,

        // currently collected metrics
        logs: [],
        metrics: [],
        events: [],

        // queue of data to send out
        chunks: [],
    }

    const pushRecord = (record, target) => {
        const recordSize = Buffer.byteLength(JSON.stringify(record), 'utf8')

        // generate a new chunk based on data size limit
        if (data.currentSize + recordSize > settings.maxChunkSize) {
            createChunk()
        }

        // queue the new record and update size counters
        data[target].push(record)
        data.currentSize += recordSize
        data.totalSize += recordSize
    }

    // empty the live data collection structure and queue a new
    // chunk that needs to be flushed out to the server
    const createChunk = () => {
        if (data.currentSize  === 0) {
            return
        }

        const chunk = {
            size: data.currentSize,
            ctime: new Date(),
            attempts: 0,
            logs: data.logs,
            metrics: data.metrics,
            events: data.events,
        }

        data.logs = []
        data.metrics = []
        data.events = []

        data.chunks.push(chunk)
        data.chunksSize += chunk.size
        data.currentSize = 0
    }

    const flushChunk = async () => {
        if (data.chunks.length === 0) {
            return 100
        }

        const chunk = data.chunks.shift()
        try {
            await flush(chunk, settings.target)
            data.totalSize -= chunk.size
            data.chunksSize -= chunk.size
        } catch (err) {
            if (chunk.attempts < 5) {
                chunk.attempts += 1
                data.chunks.unshift(chunk)
            }
        }

        return 0
    }

    // generate new chunks based on time intervals
    const chunksLoop = () => {
        createChunk()
        chunksLoop.timer = setTimeout(chunksLoop, settings.maxInterval)
    }

    // stream data to the server on regular intervals
    const flushLoop = async () => {
        const interval = await flushChunk()
        flushLoop.timer = setTimeout(flushLoop, interval)
    }


    /**
     * Public API
     */

    const publicApi = {
        log: (...args) => {
            const record = createRecord(recordType.LOG, ...args, settings)
            pushRecord(record, 'logs')
        },
        trackMetric: (...args) => {
            const record = createRecord(recordType.METRIC, ...args, settings)
            pushRecord(record, 'metrics')
        },
        pushEvent: (...args) => {
            const record = createRecord(recordType.EVENT, ...args, settings)
            pushRecord(record, 'events')
        },
        flush: () => {
            createChunk()
            clearTimeout(flushLoop.timer)
            return flushLoop()
        },
    }

    // Expose the internal stuff for testing purposes.
    if (process.env.NODE_ENV === 'test') {
        publicApi.getState = () => ({
            settings,
            data,
        })

        publicApi.createChunk = createChunk
        publicApi.flushChunk = flushChunk

    // Start the daemons right away in production
    } else {
        chunksLoop.timer = setTimeout(chunksLoop, settings.maxInterval)
        flushLoop.timer = setTimeout(flushLoop, 0)
    }

    return publicApi
}
