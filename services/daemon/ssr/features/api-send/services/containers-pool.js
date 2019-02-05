import si from 'systeminformation'
import getContainerId from 'docker-container-id'
import { logError } from 'ssr/services/logger'

const ctx = {
    currentCid: null,
    containers: {
        timer: null,
        timeout: 1000,
        isRunning: true,
    },
    data: [],
}

const containersLoop = async () => {
    if (!ctx.containers.isRunning) return

    // console.log('update containers pool')
    try {
        ctx.data = (await si.dockerContainers())
            .filter(({ id }) => id !== ctx.currentCid)

    } catch (err) {
        logError(err.message)
    }

    ctx.containers.timer = setTimeout(containersLoop, ctx.containers.timeout)
}

export const start = async ({ refreshInterval } = {}) => {
    ctx.currentCid = await getContainerId()
    ctx.containers.isRunning = true
    if (refreshInterval) {
        ctx.containers.timeout = refreshInterval
    }
    containersLoop()
}

export const stop = () => {
    ctx.containers.isRunning = false
    clearTimeout(ctx.containers.timer)
}

export const getContainersIdMap = () =>
    ctx.data.reduce((acc, curr) => ({
        ...acc,
        [curr.id]: curr,
    }), {})

export const getRunningContainers = () =>
    ctx.data
        .filter(container => container.state === 'running')

export const getRunningContainerIds = () =>
    getRunningContainers()
        .map(container => container.id)

