import { spawn } from 'child_process'
import { Tail } from 'tail'
import { logError } from 'ssr/services/logger'

const getLogFilePath = cid => [
    '/var/lib/docker/containers',
    cid,
    `${cid}-json.log`
].join('/')

export class LogTail {
    constructor (cid, handler = () => {}) {
        this.cid = cid
        this.handler = handler
        this.isActive = true
        
        // handlers for tail || spawn
        this.tail = null
        this.child = null

        this.start()
    }

    tailFile () {
        // try to restart an existing tail
        try {
            this.tail.watch()
            return
        } catch (err) {}

        // setup a new tail
        this.tail = new Tail(getLogFilePath(this.cid))
        this.tail.on('error', (err) => {
             logError('[log tail] tail error', err)
            this.restart()
        })
        this.tail.on('line', line => this.handler(line))
    }

    tailLogs () {
        this.child = spawn('docker', [ 'logs', '--tail=0', '-f', this.cid ]);
        this.child.on('exit', (code) => {
             logError('[log tail] child process exit', code)
            this.restart()
        })
        this.child.stdout.on('data', data => this.handler(data.toString()))
    }

    restart () {
        if (!this.isActive) {
            return
        }

        try {
            this.tailFile()
        } catch (err) {
            console.log('CAN NOT TAIL FILE', err)
            // this.tailLogs()
        }
    }

    start () {
        this.isActive = true
        this.restart()
    }

    stop () {
        this.isActive = false

        if (this.tail) {
            this.tail.unwatch()
            return
        }
        
        if (this.child) {
            this.child.kill('SIGINT')
            return
        }
    }
}
