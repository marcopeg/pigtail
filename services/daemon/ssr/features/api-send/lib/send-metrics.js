import { runQuery } from './graphql'

const query = `mutation trackMetrics (
    $token: String!
    $data: [MetricRecord]!  
) {
    api (token:$token) {
        trackMetrics (data: $data)
    }
}`

export const sendMetrics = async (data) => {
    const res = await runQuery(query, {
        token: sendMetrics.token,
        data,
    })

    return res.data.api.trackMetrics
}
