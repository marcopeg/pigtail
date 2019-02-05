import { INIT_SERVICE, START_SERVICE } from '@marcopeg/hooks'
import { FEATURE_NAME } from './hooks'
import { runQuery } from './lib/graphql'
import { sendMetrics } from './lib/send-metrics'

import * as containersPoolService from './services/containers-pool'
import * as logsPoolService from './services/logs-pool'
import * as metricsPoolService from './services/metrics-pool'
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
        handler: async ({ containersPool, logsPool, metricsPool, flusher }) => {
            containersPoolService.start(containersPool)
            logsPoolService.start(logsPool)
            metricsPoolService.start(metricsPool)
            flusherService.start(flusher)
        },
    })
}
