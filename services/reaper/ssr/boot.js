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
import { pathToFileURL } from 'url';

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
        .map(file => require(path.resolve(file)))
    : []

// community extensions from a mounted volume
// @NOTE: extensions should be plain NodeJS compatible, if you want to use
// weird ES6 syntax you have to transpile your extension yourself
const communityExtensions = glob
    .sync(path.resolve('/', 'var', 'lib', 'rapha', 'reaper', 'extensions', '[!_]*', 'index.js'))
    .map(file => require(path.resolve(file)))

registerAction({
    hook: SETTINGS,
    name: '♦ boot',
    handler: async ({ settings }) => {
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
            hostName: config.get('HOST_NAME'),

            // batch amount of data that get flushed
            maxMetricsBatch: config.get('FLUSHER_MAX_METRICS_BATCH', 100),
            maxLogsBatch: config.get('FLUSHER_MAX_LOGS_BATCH', 100),

            // timeouts
            emptyInterval: config.get('FLUSHER_EMPTY_INTERVAL', 2500),
            errorInterval: config.get('FLUSHER_ERROR_INTERVAL', 5000),
            interval: config.get('FLUSHER_INTERVAL', 1),
        }

        // core extensions, will be filtered by environment variable
        const enabledExtensions = config.get('EXTENSIONS', '---')
        const coreExtensions = glob
            .sync(path.resolve(__dirname, 'extensions', 'core', `@(${enabledExtensions})`, 'index.js'))
            .map(file => require(path.resolve(file)))

        // register extensions
        const extensions = [ ...devExtensions, ...coreExtensions, ...communityExtensions ]
        for (const extension of extensions) {
            if (extension.register) {
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
