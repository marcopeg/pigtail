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
            timeout: 1000,
        }

        settings.logsPool = {
            timeout: 1000,
        }
        
        settings.metricsPool = {
            timeout: 1000,
        }

        settings.flusher = {
            // batch amount of data that get flushed
            metricsLimit: 10,
            logsLimit: 10,

            // timeouts
            emptyTimeout: 2000,
            errorTimeout: 5000,
            timeout: 10,
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
