import si from 'systeminformation'
import { createHook } from '@marcopeg/hooks'
import { CONTAINER_RECORD_METRICS, CONTAINERS_COMPUTED_METRICS } from '../hooks'
// import { logError } from 'ssr/services/logger'
import { getRunningContainers } from './containers-pool'
// import { flushLogs } from './logs-pool'
// import { sendMetrics } from '../lib/send-metrics'


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

    const loop = () => {
        ctx.metrics.timer = setTimeout(metricsLoop, ctx.metrics.timeout)
    }
    
    const containers = getRunningContainers()
    const containersMetrics = await getContainersMetrics(containers)
    
    if (containers.length === 0) {
        loop()
        return
    }

    ctx.records.push({
        metric: 'containers',
        value: containersMetrics.reduce(containerMetricReducer, {}),
    })

    // extend with computed metrics
    createHook(CONTAINERS_COMPUTED_METRICS, {
        args: {
            containers: containersMetrics,
            push: record => ctx.records.push(record),
        } 
    })

    console.log(ctx.records)

    loop()
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
