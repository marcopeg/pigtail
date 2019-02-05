import { INIT_SERVICE, START_SERVICE } from '@marcopeg/hooks'
import { FEATURE_NAME } from './hooks'
import { runQuery } from './lib/graphql'
import { sendMetrics } from './lib/send-metrics'

import * as containersMetricsService from './services/containers-metrics'
import * as containersLogsService from './services/containers-logs'
import * as flusherService from './services/flusher'

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
        handler: async ({ containersStats, containersLogs, flusher }) => {
            containersMetricsService.start(containersStats)
            containersLogsService.start(containersLogs)
            flusherService.start(flusher)
        },
    })
}
