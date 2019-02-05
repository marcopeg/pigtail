import * as config from '@marcopeg/utils/lib/config'
import {
    registerAction,
    createHookApp,
    logBoot,
    SETTINGS,
    FINISH,
} from '@marcopeg/hooks'

// require('es6-promise').polyfill()
// require('isomorphic-fetch')

const services = [
    require('./services/env'),
    require('./services/logger'),
    require('./services/postgres'),
    require('./services/express/locale'),
    require('./services/express/graphql'),
    require('./services/express/ssr'),
    require('./services/express'),
]

const features = [
    require('./features/data-ingest'),
    require('./features/api-token'),
]

registerAction({
    hook: SETTINGS,
    name: '♦ boot',
    handler: ({ settings }) => {
        // list one or more connections
        settings.postgres = [{
            connectionName: 'default',
            host: config.get('PG_HOST'),
            port: config.get('PG_PORT'),
            database: config.get('PG_DATABASE'),
            username: config.get('PG_USERNAME'),
            password: config.get('PG_PASSWORD'),
            maxAttempts: Number(config.get('PG_MAX_CONN_ATTEMPTS')),
            attemptDelay: Number(config.get('PG_CONN_ATTEMPTS_DELAY')),
            models: [],
        }]

        settings.express = {
            nodeEnv: config.get('NODE_ENV'),
            port: config.get('SERVER_PORT'),
            jsonBodyLimit: '1mb',
            graphql: {
                mountPoint: config.get('GRAPHQL_MOUNT_POINT'),
            },
            locale: {
                cookieName: `${String(config.get('APP_ID'))}--locale`,
            },
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
