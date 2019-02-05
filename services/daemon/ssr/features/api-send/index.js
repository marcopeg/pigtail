import { INIT_SERVICE, START_SERVICE } from '@marcopeg/hooks'
import { FEATURE_NAME } from './hooks'
import { runQuery } from './lib/graphql'
import { sendMetrics } from './lib/send-metrics'

import * as containersPool from './services/containers-pool'
import * as logsPool from './services/logs-pool'
import * as metricsPool from './services/metrics-pool'
import * as flusher from './services/flusher'

export const register = ({ registerAction }) => {
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
        handler: async () => {
            containersPool.start()
            logsPool.start()
            metricsPool.start()
            flusher.start()
        },
    })
}
