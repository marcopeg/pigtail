import { logError } from 'ssr/services/logger'
import { getContainersIdMap } from './containers-pool'
import { flushLogs } from './logs-pool'
import { sendMetrics } from '../lib/send-metrics'


const ctx = {
    flusher: {
        timer: null,
        timeout: 2500,
        isRunning: true,
    },
}

const getLogsRecords = async (containers) => {
    const containersId = Object.keys(containers)
    const logs = flushLogs()

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

const flusherLoop = async () => {
    if (!ctx.flusher.isRunning) return
    
    const containers = getContainersIdMap()
    const metrics = []
    const logs = await getLogsRecords(containers)

    try {
        await sendMetrics(metrics, logs.records)
        logs.commit()
    } catch (err) {
        logError(err.message)
    }

    ctx.flusher.timer = setTimeout(flusherLoop, ctx.flusher.timeout)
}


export const start = ({ refreshInterval } = {}) => {
    ctx.flusher.isRunning = true
    if (refreshInterval) {
        ctx.flusher.timeout = refreshInterval
    }
    flusherLoop()
}

export const stop = () => {
    ctx.flusher.isRunning = false
    clearTimeout(ctx.flusher.timer)
}
