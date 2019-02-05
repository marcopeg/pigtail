import { FEATURE } from '@marcopeg/hooks'
import { CONTAINERS_COMPUTED_METRICS } from 'ssr/features/api-send/hooks'

export const FEATURE_NAME = `${FEATURE} MetricMemPercentTot`

export const register = ({ registerAction }) =>
    registerAction({
        hook: CONTAINERS_COMPUTED_METRICS,
        name: FEATURE_NAME,
        handler: ({ containers, push }) => {
            const reducer = (acc, curr) => (acc + curr.record.mem_percent)
            push('docker_mem_percent_tot', containers.reduce(reducer, 0))
        },
    })
