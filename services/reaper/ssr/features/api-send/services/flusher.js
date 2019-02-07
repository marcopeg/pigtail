import { logError, logDebug } from 'ssr/services/logger'
import { Daemon } from '../lib/daemon'
import { sendMetrics } from '../lib/send-metrics'
import { flushMetrics, flushLogs } from './buffer'

const ctx = {
    settings: null,
    daemon: null,
}

const handler = async () => {
    const { maxMetricsBatch, maxLogsBatch } = ctx.settings
    const metrics = await flushMetrics(maxMetricsBatch)
    const logs = await flushLogs(maxLogsBatch)

    let interval = (metrics.records.length === maxMetricsBatch || logs.records.length === maxLogsBatch)
        ? ctx.settings.interval
        : ctx.settings.intervalOnEmpty

    try {
        await sendMetrics(metrics.records, logs.records)
        metrics.commit()
        logs.commit()
    } catch (err) {
        interval = ctx.settings.intervalOnError
        logError(`[flusher] ${err.message} - metrics: ${metrics.records.length}, logs: ${logs.records.length}`)
        logDebug(err)
    }

    return interval
}

export const start = ({ interval, ...settings }) => {
    ctx.settings = settings
    ctx.daemon = new Daemon({
        name: 'flusher',
        interval,
        handler,
    })
}

export const stop = () => {
    if (ctx.daemon) {
        ctx.daemon.stop()
    }
}
