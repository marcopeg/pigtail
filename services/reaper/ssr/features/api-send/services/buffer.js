import { logVerbose } from 'ssr/services/logger'

const ctx = {
    hostName: 'pigtail',
    metrics: [],
    logs: [],
}

export const pushMetric = record =>
    ctx.metrics.push({
        ...record,
        host: ctx.hostName,
    })

export const flushMetrics = (limit = null) => {
    const flushLen = (limit !== null && limit < ctx.metrics.length)
        ? limit
        : ctx.metrics.length

    logVerbose(`[buffer/metrics] send ${flushLen} of ${ctx.metrics.length}`)

    return {
        records: ctx.metrics.slice(0, flushLen),
        commit: () => ctx.metrics.splice(0, flushLen),
    }
}

export const pushLog = record =>
    ctx.logs.push({
        host: ctx.hostName,
        process: record.process.name,
        message: record.log.log,
        meta: {
            stream: record.log.stream,
            cid: record.cid,
        },
    })

export const flushLogs = (limit = null) => {
    const flushLen = (limit !== null && limit < ctx.logs.length)
        ? limit
        : ctx.logs.length

    logVerbose(`[buffer/logs] send ${flushLen} of ${ctx.logs.length}`)

    return {
        records: ctx.logs.slice(0, flushLen),
        commit: () => ctx.logs.splice(0, flushLen),
    }
}

export const start = (settings) => {
    if (settings.hostName) {
        ctx.hostName = settings.hostName
    }
}