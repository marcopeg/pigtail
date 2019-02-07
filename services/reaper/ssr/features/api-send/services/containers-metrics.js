import si from 'systeminformation'
import { createHook } from '@marcopeg/hooks'
import getContainerId from 'docker-container-id'
import { logError, logDebug } from 'ssr/services/logger'
import { CONTAINER_METRICS, DOCKER_METRICS } from '../hooks'
import { Daemon } from '../lib/daemon'
import { pushMetric } from './buffer'

const ctx = {
    daemon: null,
    currentCid: null,
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

const handler = async () => {
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
        logError(`[containers-metrics] ${err.message}`)
        logDebug(err)
    }
}

export const start = async ({ interval }) => {
    ctx.currentCid = await getContainerId()
    ctx.daemon = new Daemon({
        name: 'containers-metrics',
        interval,
        handler,
    })
}

export const stop = () => {
    if (ctx.daemon) {
        ctx.daemon.stop()
    }
}
