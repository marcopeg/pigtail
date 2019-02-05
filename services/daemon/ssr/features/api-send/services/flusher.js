import { logError, logInfo } from 'ssr/services/logger'
import { getContainersIdMap } from './containers-pool'
import { flushLogs } from './logs-pool'
import { flushMetrics } from './metrics-pool'
import { sendMetrics } from '../lib/send-metrics'

const ctx = {
    flusher: {
        timer: null,
        isRunning: true,
    },
}

const getLogsRecords = async (limit, containers) => {
    const containersId = Object.keys(containers)
    const logs = flushLogs(limit)

    const records = logs.records
        .filter(record => containersId.includes(record.cid))
        .map(record => ({
            ctime: record.log.time,
            host: 'xxx',
            container: containers[record.cid].name,
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
    const logs = flushMetrics(limit)
    const records = logs.records
        .map(record => ({
            ...record,
            host: 'xxx',
        }))
    
    return {
        ...logs,
        records,
    }
}

const flusherLoop = async () => {
    if (!ctx.flusher.isRunning) return

    const { metricsLimit, logsLimit } = ctx.settings
    
    const containers = getContainersIdMap()
    const metrics = await getMetricRecords(metricsLimit)
    const logs = await getLogsRecords(logsLimit, containers)

    let timeout = (metrics.records.length === metricsLimit || logs.records.length === logsLimit)
        ? ctx.settings.timeout
        : ctx.settings.emptyTimeout

    try {
        await sendMetrics(metrics.records, logs.records)
        logs.commit()
        metrics.commit()
    } catch (err) {
        timeout = ctx.settings.errorTimeout
        logError(`[flusher] ${err.message} - metrics: ${metrics.records.length}, logs: ${logs.records.length}`)
    }

    ctx.flusher.timer = setTimeout(flusherLoop, timeout)
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
