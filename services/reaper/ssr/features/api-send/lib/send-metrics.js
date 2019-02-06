import { runQuery } from './graphql'

const query = `mutation trackMetrics (
    $token: String!
    $metrics: [MetricRecord]!  
    $logs: [LogRecord]!  
) {
    api (token:$token) {
        trackMetrics (data: $metrics)
        trackLogs (data: $logs)
    }
}`

export const sendMetrics = async (metrics, logs) => {
    const res = await runQuery(query, {
        token: sendMetrics.token,
        metrics,
        logs,
    })

    return res.data.api.trackMetrics
}
