import si from 'systeminformation'
import * as config from '@marcopeg/utils/lib/config'
import { DAEMONS_START } from 'ssr/features/api-send/hooks'

export const name = 'metric-host-mem'

export const daemonHandler = async (ctx, actions) =>
    actions.pushMetric('host-mem', await si.mem())

export const register = ({ registerAction }) => {
    const daemonSettings = {
        name,
        interval: config.get('METRIC_HOST_MEM_INTERVAL', 2500),
        handler: daemonHandler,
    }

    registerAction({
        hook: DAEMONS_START,
        name,
        trace: __filename,
        handler: ({ createDaemon }) => createDaemon(daemonSettings),
    })
}
