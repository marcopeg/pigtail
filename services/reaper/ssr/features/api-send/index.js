import { INIT_SERVICE, START_SERVICE } from '@marcopeg/hooks'
import { FEATURE_NAME } from './hooks'
import { runQuery } from './lib/graphql'
import { sendMetrics } from './lib/send-metrics'

import * as containersMetricsService from './services/containers-metrics'
import * as containersLogsService from './services/containers-logs'
import * as daemonsService from './services/daemons'
import * as flusherService from './services/flusher'
import * as bufferService from './services/buffer'

export const register = ({ registerAction, settings }) => {
    registerAction({
        hook: INIT_SERVICE,
        name: FEATURE_NAME,
        handler: ({ api }) => {
            runQuery.endpoint = api.endpoint
            sendMetrics.token = api.token
        },
    })

    registerAction({
        hook: START_SERVICE,
        name: FEATURE_NAME,
        trace: __filename,
        handler: async (settings) => {
            bufferService.start(settings.buffer)
            daemonsService.start(settings.daemons)
            flusherService.start(settings.flusher)
            
            containersMetricsService.start(settings.containersMetrics)
            containersLogsService.start(settings.containersLogs)
        },
    })
}
