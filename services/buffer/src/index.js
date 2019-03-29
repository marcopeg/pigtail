import { validateSettings } from './validate-settings'
import { createRecord, recordType } from './create-record'

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

    // empty the live data collection structure and queue a new
    // chunk that needs to be flushed out to the server
    const createChunk = () => {
        const chunk = {
            size: data.currentSize,
            ctime: new Date(),
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

    // generate new chunks based on time intervals
    const loop = () => {
        (data.currentSize > 0) && createChunk()
        loop.timer = setTimeout(loop, settings.maxInterval)
    }

    loop.timer = setTimeout(loop, settings.maxInterval)

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

    /**
     * Public API
     */

    const ctx = {
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

    }

    // Expise the internal state for testing purposes.
    if (process.env.NODE_ENV === 'test') {
        ctx.getState = () => ({
            settings,
            data,
        })
    }

    return ctx
}
