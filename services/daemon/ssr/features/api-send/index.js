
import { INIT_SERVICE, START_SERVICE } from '@marcopeg/hooks'
import si from 'systeminformation'
import getContainerId from 'docker-container-id'
import { FEATURE_NAME } from './hooks'
import { runQuery } from './lib/graphql'
import { sendMetrics } from './lib/send-metrics'
import * as runner from './runner'
import * as metrics from './metrics'
import { LogTail } from './lib/log-tail'

export const register = ({ registerAction }) => {
    registerAction({
        hook: INIT_SERVICE,
        name: FEATURE_NAME,
        handler: ({ api }) => {
            runQuery.endpoint = api.endpoint
            sendMetrics.token = api.token
        },
    })

    registerAction({
        hook: START_SERVICE,
        name: FEATURE_NAME,
        trace: __filename,
        handler: async () => {
            // runner.start()
            // metrics.snap().then(data => console.log(data))

            const ccid = await getContainerId()

            const containers = await si.dockerContainers()
            containers
                .filter(container => container.id !== ccid)
                .map(container => {
                    console.log(container.id, container.id === ccid)
                    new LogTail(container.id, log => {
                        console.log(`${container.name} - `, log)
                    })
                })

            // const data = await metrics.snap()
            // data.map(container => {
            //     console.log(container.value.id)
                
            // })

            // const foo = new LogTail('0ac7564065b78553de7989aa3c5fbb45ad565b8acbdbfe2b0ae2a81f63584f22', log => {
            //     console.log('>>>>', log)
            // })

            
        },
    })
}
