import { logError } from 'ssr/services/logger'
import { sendMetrics } from '../lib/send-metrics'

import { flushMetrics, flushLogs } from './buffer'

const ctx = {
    flusher: {
        timer: null,
        isRunning: true,
    },
}

const flusherLoop = async () => {
    const start = new Date()
    if (!ctx.flusher.isRunning) return

    const { maxMetricsBatch, maxLogsBatch } = ctx.settings
    const metrics = await flushMetrics(maxMetricsBatch)
    const logs = await flushLogs(maxLogsBatch)

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
    flusherLoop()
}

export const stop = () => {
    ctx.flusher.isRunning = false
    clearTimeout(ctx.flusher.timer)
}
