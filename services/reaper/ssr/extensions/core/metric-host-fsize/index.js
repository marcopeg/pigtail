import glob from 'glob'
import * as config from '@marcopeg/utils/lib/config'
import { DAEMONS_START } from 'ssr/features/api-send/hooks'
import { parsedDu } from './du'

export const name = 'metric-host-fsize'

export const daemonHandler = async (ctx, actions) => {
    const targets = glob.sync('/var/lib/rapha/fsize/*')
    if (!targets.length) return

    const data = {}
    for (const target of targets) {
        data[target.split('/').pop()] = await parsedDu(target)
    }

    actions.pushMetric('host-fsize', data)
}

export const register = ({ registerAction }) => {
    const daemonSettings = {
        name,
        interval: config.get('METRIC_HOST_FSIZE_INTERVAL', 5000),
        handler: daemonHandler,
    }

    registerAction({
        hook: DAEMONS_START,
        name,
        trace: __filename,
        handler: ({ createDaemon }) => createDaemon(daemonSettings),
    })
}
