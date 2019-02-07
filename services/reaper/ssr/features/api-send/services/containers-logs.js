import { logVerbose } from 'ssr/services/logger'
import { LogTail } from '../lib/log-tail'
import { getLoggableContainerIds, getContainerById } from './containers-metrics'
import { pushLog } from './buffer'

const ctx = {
    status: {
        timer: null,
        settings: {},
        isRunning: true,
    },
    pool: {},
}

const createLogger = cid => log => {
    const record = { cid, log, container: getContainerById(cid) }
    pushLog(record)
}

const purgePool = cids =>
    Object.keys(ctx.pool)
        .filter(cid => !cids.includes(cid))
        .forEach(cid => {
            ctx.pool[cid].stop()
            delete(ctx.pool[cid])
        })

const populatePool = cids =>
    cids
        .filter(cid => ctx.pool[cid] === undefined)
        .forEach(cid => {
            ctx.pool[cid] = new LogTail(cid, createLogger(cid))
        })

const logsLoop = async () => {
    const start = new Date()
    if (!ctx.status.isRunning) return
    
    const cids = getLoggableContainerIds()
    purgePool(cids)
    populatePool(cids)

    // calculate next execution timeout based on execution time
    const lapsed = new Date() - start
    const interval = ctx.settings.interval > lapsed
        ? ctx.settings.interval - lapsed
        : 0

    // console.log('new logs check in', lapsed, interval)
    ctx.status.timer = setTimeout(logsLoop, interval)
}


export const start = (settings) => {
    ctx.settings = settings
    ctx.status.isRunning = true
    logsLoop()
}

export const stop = () => {
    ctx.status.isRunning = false
    clearTimeout(ctx.status.timer)
}
