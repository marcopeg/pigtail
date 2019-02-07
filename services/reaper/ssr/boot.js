import path from 'path'
import glob from 'glob'
import * as config from '@marcopeg/utils/lib/config'
import {
    registerAction,
    createHook,
    createHookApp,
    logBoot,
    SETTINGS,
    FINISH,
} from '@marcopeg/hooks'
import { logInfo } from 'ssr/services/logger'

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

// development extensions from a local folder
// @NOTE: extensions should be plain NodeJS compatible, if you want to use
// weird ES6 syntax you have to transpile your extension yourself
const devExtensions = process.env.NODE_ENV === 'development'
    ? glob
        .sync(path.resolve(__dirname, 'extensions', 'dev', '[!_]*', 'index.js'))
    : []

// community extensions from a mounted volume
// @NOTE: extensions should be plain NodeJS compatible, if you want to use
// weird ES6 syntax you have to transpile your extension yourself
const communityExtensions = glob
    .sync(path.resolve('/', 'var', 'lib', 'rapha', 'extensions', '[!_]*', 'index.js'))

registerAction({
    hook: SETTINGS,
    name: '♦ boot',
    handler: async ({ settings }) => {
        settings.api = {
            endpoint: config.get('API_ENDPOINT'),
            token: config.get('API_TOKEN'),
        }

        settings.containersMetrics = {
            interval: config.get('CONTAINERS_METRICS_INTERVAL', 5000),
        }

        settings.containersLogs = {
            interval: config.get('CONTAINERS_LOGS_INTERVAL', 5000),
        }

        settings.daemons = {}

        settings.buffer = {
            hostName: config.get('HOST_NAME'),
        }

        settings.flusher = {
            // batch amount of data that get flushed
            maxMetricsBatch: config.get('FLUSHER_MAX_METRICS_BATCH', 100),
            maxLogsBatch: config.get('FLUSHER_MAX_LOGS_BATCH', 100),

            // timeouts
            interval: config.get('FLUSHER_INTERVAL', 1),
            intervalOnEmpty: config.get('FLUSHER_EMPTY_INTERVAL', 5000),
            intervalOnError: config.get('FLUSHER_ERROR_INTERVAL', 5000),
        }

        // core extensions, will be filtered by environment variable
        const enabledExtensions = config.get('EXTENSIONS', '---') || 'preset-default'
        const coreExtensions = glob
            .sync(path.resolve(__dirname, 'extensions', 'core', `@(${enabledExtensions})`, 'index.js'))

        // register extensions
        const extensions = [ ...devExtensions, ...coreExtensions, ...communityExtensions ]
        for (const extensionPath of extensions) {
            const extension = require(extensionPath)
            if (extension.register) {
                logInfo(`activate extension: ${extensionPath}`)
                await extension.register({
                    registerAction,
                    createHook,
                    settings: { ...settings },
                })
            }
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
