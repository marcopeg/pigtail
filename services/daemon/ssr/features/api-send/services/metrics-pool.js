import si from 'systeminformation'
import { createHook } from '@marcopeg/hooks'
import { logInfo } from 'ssr/services/logger'
import { CONTAINER_RECORD_METRICS, CONTAINERS_COMPUTED_METRICS } from '../hooks'
import { getRunningContainers } from './containers-pool'

const ctx = {
    metrics: {
        timer: null,
        timeout: 2500,
        isRunning: true,
    },
    records: [],
}

const containerStatsReducer = (acc, curr) => ({ ...acc, [curr.id]: curr })
const containerMetricReducer = (acc, curr) => ({ ...acc, [curr.record.name]: curr.record })

const getContainersMetrics = async (containers) => {
    const stats = await Promise.all(containers.map(({ id }) => si.dockerContainerStats(id)))
    const statsMap = stats.reduce(containerStatsReducer, {})

    return containers.map(container => {
        const stats = statsMap[container.id]
        const record = {
            cid: container.id,
            name: container.name,
            mem_percent: stats ? stats.mem_percent : 0,
            cpu_percent: stats ? stats.cpu_percent : 0,
        }

        // container stats extension point
        createHook(CONTAINER_RECORD_METRICS, { args: { container, stats, record } })

        return { container, stats, record }
    })
}

const metricsLoop = async () => {
    if (!ctx.metrics.isRunning) return

    const ctime = new Date()
    const push = (metric, value) =>
    ctx.records.push({
        metric,
        value,
        ctime,
    })
    
    const containers = getRunningContainers()
    const containersMetrics = await getContainersMetrics(containers)
    
    if (containers.length !== 0) {
        push('containers', containersMetrics.reduce(containerMetricReducer, {}))

        // extend with computed metrics
        createHook(CONTAINERS_COMPUTED_METRICS, {
            args: {
                push,
                containers: containersMetrics,
            } 
        })
    }

    // console.log(ctx.records)
    ctx.metrics.timer = setTimeout(metricsLoop, ctx.metrics.timeout)
}


export const start = ({ refreshInterval } = {}) => {
    ctx.metrics.isRunning = true
    if (refreshInterval) {
        ctx.metrics.timeout = refreshInterval
    }
    metricsLoop()
}

export const stop = () => {
    ctx.metrics.isRunning = false
    clearTimeout(ctx.metrics.timer)
}

// returns a list of records to flush, plus a "commit callback" to be
// invoked when the operation is completed to actually remove the
// flushed records from memory
export const flushMetrics = (limit = null) => {
    const flushLen = (limit !== null && limit < ctx.records.length)
        ? limit
        : ctx.records.length

    logInfo(`[flushMetrics] send ${flushLen} of ${ctx.records.length}`)

    return {
        records: ctx.records.slice(0, flushLen),
        commit: () => ctx.records.splice(0, flushLen),
    }
}
