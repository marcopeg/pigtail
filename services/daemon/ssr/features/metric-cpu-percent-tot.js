import { FEATURE } from '@marcopeg/hooks'
import { CONTAINERS_COMPUTED_METRICS } from 'ssr/features/api-send/hooks'

export const FEATURE_NAME = `${FEATURE} MetricCpuPercentTot`

export const register = ({ registerAction }) =>
    registerAction({
        hook: CONTAINERS_COMPUTED_METRICS,
        name: FEATURE_NAME,
        handler: ({ containers, push }) => {
            const reducer = (acc, curr) => (acc + curr.record.cpu_percent)
            push('docker_cpu_percent_tot', containers.reduce(reducer, 0))
        },
    })
