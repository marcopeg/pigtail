import { sendMetrics } from './lib/send-metrics'
import { logError } from 'ssr/services/logger'
import { snap } from './metrics'

const state = {
    metricInterval: 1000,
    metricTimer: null,
    flushInterval: 5000,
    flushTimer: null,
    isRunning: false,
}

const records = []

const metricsLoop = async () => {
    if (!state.isRunning) return

    try {
        const data = await snap()
        records.push(...data)
    } catch (err) {
        logError(err.message)
    }

    state.metricIimer = setTimeout(metricsLoop, state.metricInterval)
}

const flusherLoop = async () => {
    if (!state.isRunning) return

    try {
        const data = records.splice(0, records.length)
        await sendMetrics(data)
    } catch (err) {
        logError(err.message)
    }

    state.flushTimer = setTimeout(flusherLoop, state.flushInterval)
}

export const start = () => {
    state.isRunning = true
    metricsLoop()
    flusherLoop()
}

export const stop = () => {
    clearInterval(state.metricInterval)
    clearInterval(state.flushInterval)
    state.isRunning = false
}
