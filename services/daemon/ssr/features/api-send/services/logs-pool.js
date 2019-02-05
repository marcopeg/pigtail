import { logInfo } from 'ssr/services/logger'
import { getRunningContainerIds } from './containers-pool'
import { LogTail } from '../lib/log-tail'

const ctx = {
    logs: {
        timer: null,
        timeout: 1000,
        isRunning: true,
    },
    pool: {},
    records: [],
}

const createLogger = cid => log =>
    ctx.records.push({ cid, log })

const purgePool = containerIds =>
    Object.keys(ctx.pool)
        .filter(id => !containerIds.includes(id))
        .forEach(id => {
            ctx.pool[id].stop()
            delete(ctx.pool[id])
        })

const populatePool = containerIds =>
    containerIds
        .filter(cid => ctx.pool[cid] === undefined)
        .forEach(cid => {
            ctx.pool[cid] = new LogTail(cid, createLogger(cid))
        })

const logsLoop = async () => {
    if (!ctx.logs.isRunning) return
    
    const ids = getRunningContainerIds()
    purgePool(ids)
    populatePool(ids)

    ctx.logs.timer = setTimeout(logsLoop, ctx.logs.timeout)
}


export const start = ({ refreshInterval } = {}) => {
    ctx.logs.isRunning = true
    if (refreshInterval) {
        ctx.logs.timeout = refreshInterval
    }
    logsLoop()
}

export const stop = () => {
    ctx.logs.isRunning = false
    clearTimeout(ctx.logs.timer)
}

// returns a list of records to flush, plus a "commit callback" to be
// invoked when the operation is completed to actually remove the
// flushed records from memory
export const flushLogs = (limit = null) => {
    const flushLen = (limit !== null && limit < ctx.records.length)
        ? limit
        : ctx.records.length

    logInfo(`[flushLogs] send ${flushLen} of ${ctx.records.length}`)

    return {
        records: ctx.records.slice(0, flushLen),
        commit: () => ctx.records.splice(0, flushLen),
    }
}
