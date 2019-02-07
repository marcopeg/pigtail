import * as config from '@marcopeg/utils/lib/config'
import { DAEMONS_START } from 'ssr/features/api-send/hooks'
import { parsedDf } from './df'

export const name = 'metric-host-disk'

export const daemonHandler = async (ctx, actions) => {
    const data = (await parsedDf())
        .filter(ctx.filterHandler)
        .reduce((acc, curr) => ({ ...acc, [curr.mount]: curr}), {})

    actions.pushMetric('host-disk', data)
}

export const register = ({ registerAction }) => {
    // list all the disk that you want to map using ";;" as delimiter
    // ";;/;;/mnt/data;;"
    //
    // to list all disks, simply write "all"
    const filterRule = config.get('METRIC_HOST_DISK_FILTER', ';/;')

    const filterHandler = filterRule === 'all'
        ? () => true
        : (disk) => filterRule.indexOf(`;${disk.mount};`) !== -1

    const daemonSettings = {
        name,
        interval: config.get('METRIC_HOST_DISK_INTERVAL', 5000),
        handler: daemonHandler,
        context: { filterHandler }
    }

    registerAction({
        hook: DAEMONS_START,
        name,
        trace: __filename,
        handler: ({ createDaemon }) => createDaemon(daemonSettings),
    })
}
