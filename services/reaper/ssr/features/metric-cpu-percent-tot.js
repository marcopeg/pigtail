import { FEATURE } from '@marcopeg/hooks'
import { DOCKER_METRICS } from 'ssr/features/api-send/hooks'

export const FEATURE_NAME = `${FEATURE} MetricCpuPercentTot`

export const register = ({ registerAction }) =>
    registerAction({
        hook: DOCKER_METRICS,
        name: FEATURE_NAME,
        handler: ({ containers, push }) => {
            const reducer = (acc, curr) => (acc + curr.cpu_percent)
            const total = containers.reduce(reducer, 0)
            push('docker_cpu_percent_tot', Math.round(total * 100) / 100)
        },
    })
