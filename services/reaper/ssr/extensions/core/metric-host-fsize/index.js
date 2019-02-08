import glob from 'glob'
import * as config from '@marcopeg/utils/lib/config'
import { logInfo } from 'ssr/services/logger'
import { DAEMONS_START } from 'ssr/features/api-send/hooks'
import { parsedDu } from './du'

export const name = 'metric-host-fsize'

// fills up a list of targets from mounted volumes and assigns
// the alias as last folder name
const getTargetsFromVolumes = () => glob
    .sync('/var/lib/rapha/fsize/*')
    .map(s => `${s}::${s.split('/').pop()}`)

export const daemonHandler = async (ctx, actions) => {
    const data = {}
    for (const target of ctx.targets) {
        const [ fpath, alias ] = target.split('::')
        data[alias || fpath] = await parsedDu(fpath)
    }

    actions.pushMetric('host-fsize', data)
}

export const register = ({ registerAction }) => {
    const targetsConfig = config.get('METRIC_HOST_FSIZE_TARGETS', '---')
    const targets = targetsConfig === '---'
        ? getTargetsFromVolumes()
        : targetsConfig.split(';')

    if (!targets.length) {
        logInfo('[metric-host-fsize] no targets match the rules')
        return
    }

    const daemonSettings = {
        name,
        interval: config.get('METRIC_HOST_FSIZE_INTERVAL', 5000),
        handler: daemonHandler,
        context: { targets },
    }

    registerAction({
        hook: DAEMONS_START,
        name,
        trace: __filename,
        handler: ({ createDaemon }) => createDaemon(daemonSettings),
    })
}
