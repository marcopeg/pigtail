import { LogTail } from '../lib/log-tail'
import { getLoggableContainerIds, getContainerById } from './containers-metrics'
import { Daemon } from '../lib/daemon'
import { pushLog } from './buffer'

const ctx = {
    daemon: null,
    pool: {},
}

const createLogger = cid => log => {
    const record = { cid, log, process: getContainerById(cid) }
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

const handler = () => {
    const cids = getLoggableContainerIds()
    purgePool(cids)
    populatePool(cids)
}


export const start = ({ interval }) => {
    ctx.daemon = new Daemon({
        name: 'containers-logs',
        interval,
        handler,
    })
}

export const stop = () => {
    if (ctx.daemon) {
        ctx.daemon.stop()
    }
}
