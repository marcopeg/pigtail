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
    require('./features/containers'),
    require('./features/data-ingest'),
    require('./features/api-token'),
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

        settings.apiToken = {
            defaultToken: config.get('API_DEFAULT_TOKEN'),
        }

        // core extensions, will be filtered by environment variable
        const enabledExtensions = config.get('EXTENSIONS', '---')
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
