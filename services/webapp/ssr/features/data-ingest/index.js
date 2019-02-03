import { POSTGRES_BEFORE_START } from 'ssr/services/postgres/hooks'
import { API_TOKEN_QUERIES } from 'ssr/features/api-token/hooks'
import { FEATURE_NAME } from './hooks'
import { trackMetrics } from './track-metrics.mutation'
import * as Metric from './metric.model'

export const register = ({ registerAction }) => {
    registerAction({
        hook: `${POSTGRES_BEFORE_START}/default`,
        name: FEATURE_NAME,
        handler: ({ options }) => {
            options.models.push(Metric)
        },
    })

    registerAction({
        hook: API_TOKEN_QUERIES,
        name: FEATURE_NAME,
        trace: __filename,
        handler: ({ queries, mutations }) => {
            mutations.trackMetrics = trackMetrics()
        },
    })
}
