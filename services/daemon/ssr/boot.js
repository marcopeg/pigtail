import * as config from '@marcopeg/utils/lib/config'
import {
    registerAction,
    createHookApp,
    logBoot,
    SETTINGS,
    FINISH,
} from '@marcopeg/hooks'

require('es6-promise').polyfill()
require('isomorphic-fetch')

const services = [
    require('./services/env'),
    require('./services/logger'),
]

const features = [
    require('./features/metric-cpu-percent-tot'),
    require('./features/metric-mem-usage-tot'),
    require('./features/api-send'),
]

registerAction({
    hook: SETTINGS,
    name: '♦ boot',
    handler: ({ settings }) => {
        settings.api = {
            endpoint: config.get('API_ENDPOINT'),
            token: config.get('API_TOKEN'),
        }

        settings.containersStats = {
            interval: config.get('CONTAINERS_STATS_INTERVAL', 1000),
        }

        settings.containersLogs = {
            interval: config.get('CONTAINERS_LOGS_INTERVAL', 1000),
        }

        settings.flusher = {
            // batch amount of data that get flushed
            maxMetricsBatch: config.get('FLUSHER_MAX_METRICS_BATCH', 100),
            maxLogsBatch: config.get('FLUSHER_MAX_LOGS_BATCH', 100),

            // timeouts
            emptyInterval: config.get('FLUSHER_EMPTY_INTERVAL', 2500),
            errorInterval: config.get('FLUSHER_ERROR_INTERVAL', 5000),
            interval: config.get('FLUSHER_INTERVAL', 1),
        }
    },
})

registerAction({
    hook: FINISH,
    name: '♦ boot',
    handler: () => logBoot(),
})

export default createHookApp({
    settings: { cwd: process.cwd() },
    services,
    features,
})
