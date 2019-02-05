import { logError, logInfo } from 'ssr/services/logger'
import { flushContainersLogs } from './containers-logs'
import { flushContainersMetrics } from './containers-metrics'
import { sendMetrics } from '../lib/send-metrics'

const ctx = {
    flusher: {
        timer: null,
        isRunning: true,
    },
}

const getLogsRecords = async (limit) => {
    const logs = flushContainersLogs(limit)
    const records = logs.records
        .map(record => ({
            host: ctx.settings.hostName,
            container: record.container.name,
            message: record.log.log,
            meta: {
                stream: record.log.stream,
                cid: record.cid,
            },
        }))

    return {
        ...logs,
        records,
    }
}

const getMetricRecords = async (limit) => {
    const stats = flushContainersMetrics(limit)
    const records = stats.records
        .map(record => ({
            ...record,
            host: ctx.settings.hostName,
        }))
    
    return {
        ...stats,
        records,
    }
}

const flusherLoop = async () => {
    const start = new Date()
    if (!ctx.flusher.isRunning) return

    const { maxMetricsBatch, maxLogsBatch } = ctx.settings
    const metrics = await getMetricRecords(maxMetricsBatch)
    const logs = await getLogsRecords(maxLogsBatch)

    let interval = (metrics.records.length === maxMetricsBatch || logs.records.length === maxLogsBatch)
        ? ctx.settings.interval
        : ctx.settings.emptyInterval

    try {
        await sendMetrics(metrics.records, logs.records)
        metrics.commit()
        logs.commit()
    } catch (err) {
        interval = ctx.settings.errorInterval
        logError(`[flusher] ${err.message} - metrics: ${metrics.records.length}, logs: ${logs.records.length}`)
    }

    // calculate next execution timeout based on execution time
    const lapsed = new Date() - start
    interval = interval > lapsed ? interval - lapsed : 0

    ctx.flusher.timer = setTimeout(flusherLoop, interval)
}


export const start = (settings) => {
    ctx.flusher.isRunning = true
    ctx.settings = settings
    flusherLoop(settings)
}

export const stop = () => {
    ctx.flusher.isRunning = false
    clearTimeout(ctx.flusher.timer)
}
