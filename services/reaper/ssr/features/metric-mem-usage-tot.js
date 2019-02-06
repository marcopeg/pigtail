import { FEATURE } from '@marcopeg/hooks'
import { DOCKER_METRICS } from 'ssr/features/api-send/hooks'

export const FEATURE_NAME = `${FEATURE} MetricMemUsageTot`

export const register = ({ registerAction }) =>
    registerAction({
        hook: DOCKER_METRICS,
        name: FEATURE_NAME,
        handler: ({ containers, push }) => {
            const reducer = (acc, curr) => (acc + curr.mem_usage)
            push('docker_mem_usage_tot', containers.reduce(reducer, 0))
        },
    })
