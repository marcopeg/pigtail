import { logInfo } from 'ssr/services/logger'

import * as metricHostDisk from '../metric-host-disk'
import * as metricHostMem from '../metric-host-mem'

export const register = async (info) => {
    logInfo(`[preset-default] activate extension: metric-host-disk`)
    await metricHostDisk.register(info)

    logInfo(`[preset-default] activate extension: metric-host-mem`)
    await metricHostMem.register(info)
}
