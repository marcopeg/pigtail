import si from 'systeminformation'
import { createHook } from '@marcopeg/hooks'
import getContainerId from 'docker-container-id'
import { logError, logVerbose } from 'ssr/services/logger'
import { CONTAINER_METRICS, DOCKER_METRICS } from '../hooks'
import { pushMetric } from './buffer'

const ctx = {
    currentCid: null,
    status: {
        timer: null,
        settings: {},
        isRunning: true,
    },
    containers: [],
    containersMap: {},
}

export const getContainers = () => ctx.containers

export const getContainerById = id => ctx.containersMap[id]
    ? { ...ctx.containersMap[id] }
    : undefined

export const getContainersNameMap = () =>
    getContainers().reduce((acc, curr) => ({
        ...acc,
        [curr.name]: curr,
    }), {})

export const getRunningContainers = () =>
    getContainers()
        .filter(container => container.state === 'running')

export const getLoggableContainerIds = () =>
    getRunningContainers()
        .filter(container => !container.isDaemon)
        .map(container => container.cid)

const fetchStats = async () =>
    (await si.dockerAll())
        .map(container => {
            // basic informations to show something like "ctop"
            const record = {
                cid: container.id,
                name: container.name,
                state: container.state,
                cpu_percent: container.cpu_percent,
                mem_usage: container.mem_usage,
                mem_limit: container.mem_limit,
                net_rx: container.netIO.rx,
                net_tx: container.netIO.tx || container.netIO.wx,
                block_r: container.blockIO.r,
                block_w: container.blockIO.w,
                isDaemon: container.id === ctx.currentCid,
            }

            // container metrics extension point
            createHook(CONTAINER_METRICS, { args: { container, record } })

            return record
        })

const containersLoop = async () => {
    const start = new Date()
    if (!ctx.status.isRunning) return

    const ctime = new Date()
    const push = (metric, value) => {
        const record = {
            metric,
            value,
            ctime,
        }
        pushMetric(record)
    }

    try {
        ctx.containers = await fetchStats()
        ctx.containersMap = ctx.containers
            .reduce((acc, curr) => ({ ...acc, [curr.cid]: curr }), {})

        push('containers', getContainersNameMap())
        
        // extend with computed metrics
        createHook(DOCKER_METRICS, {
            args: {
                push,
                containers: [ ...ctx.containers ],
            } 
        })
    } catch (err) {
        logError(err.message)
    }

    // calculate next execution timeout based on execution time
    const lapsed = new Date() - start
    const interval = ctx.settings.interval > lapsed
        ? ctx.settings.interval - lapsed
        : 0
    
    ctx.status.timer = setTimeout(containersLoop, interval)
}

export const start = async (settings) => {
    ctx.settings = settings
    ctx.currentCid = await getContainerId()
    ctx.status.isRunning = true
    containersLoop()
}

export const stop = () => {
    ctx.status.isRunning = false
    clearTimeout(ctx.status.timer)
}
