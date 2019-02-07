import { createHook } from '@marcopeg/hooks'
import { DAEMONS_START } from '../hooks'
import { Daemon } from '../lib/daemon'
import { pushMetric } from './buffer'

const ctx = {
    daemons: [],
}

const wrapperPushMetric = (metric, value) => pushMetric({
    ctime: new Date(),
    metric,
    value,
})

const createDaemon = ({ name, interval, handler, context }) => {
    const wrapperHandler = (ctx) => handler(ctx, {
        pushMetric: wrapperPushMetric,
    })

    const daemon = new Daemon({
        name,
        interval,
        context,
        handler: wrapperHandler,
    })

    ctx.daemons.push(daemon)
}

export const start = (settings = {}) =>
    createHook(DAEMONS_START, { args: { createDaemon, settings } })

export const stop = () =>
    daemons.forEach(daemon => daemon.stop())

