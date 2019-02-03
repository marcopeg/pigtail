
import { INIT_SERVICE, START_SERVICE } from '@marcopeg/hooks'
import { FEATURE_NAME } from './hooks'
import { runQuery } from './lib/graphql'
import { sendMetrics } from './lib/send-metrics'
import * as runner from './runner'
import * as metrics from './metrics'

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
        handler: () => {
            runner.start()
            // metrics.snap().then(data => console.log(data))
        },
    })
}
