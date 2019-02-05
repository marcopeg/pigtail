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
    require('./features/metric-mem-percent-tot'),
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

        settings.containersPool = {
            timeout: config.get('CONTAINERS_POOL_TIMEOUT', 1000),
        }

        settings.logsPool = {
            timeout: config.get('LOGS_POOL_TIMEOUT', 1000),
        }
        
        settings.metricsPool = {
            timeout: config.get('METRICS_POOL_TIMEOUT', 1000),
        }

        settings.flusher = {
            // batch amount of data that get flushed
            metricsLimit: config.get('FLUSHER_METRICS_LIMIT', 100),
            logsLimit: config.get('FLUSHER_LOGD_SIMIT', 100),

            // timeouts
            emptyTimeout: config.get('FLUSHER_EMPTY_TIMEOUT', 2500),
            errorTimeout: config.get('FLUSHER_ERROR_TIMEOUT', 5000),
            timeout: config.get('FLUSHER_TIMEOUT', 1),
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
