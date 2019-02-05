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
    },
})

registerAction({
    hook: FINISH,
    name: '♦ boot',
    handler: () => logBoot(),
})

// registerAction({
//     hook: require('./features/api-send/hooks').CONTAINER_RECORD_METRICS,
//     handler: (args) => {
//         args.record.foo = 123
//     }
// })

export default createHookApp({
    settings: { cwd: process.cwd() },
    services,
    features,
})
