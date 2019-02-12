import { spawn } from 'child_process'
import { Tail } from 'tail'
import { logError, logVerbose } from 'ssr/services/logger'

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

        // collects restarts occourrances so to slow down
        // the restart in case of troubles
        this.restartsCount = 0
        this.restartTimer = null
        this.restartDelay = 250

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
            logError(`[log tail] tail error - ${this.cid}`, code)
            this.restart()
        })
        this.tail.on('line', line => {
            try {
                const log = JSON.parse(line)
                this.handler(log)
            } catch (err) {
                this.handler({
                    log: line,
                    stream: 'string',
                    time: (new Date()).toISOString()
                })
            }
        })
    }

    tailLogs () {
        this.child = spawn('docker', [ 'logs', '--tail=0', '-f', this.cid ]);
        this.child.on('exit', (code) => {
            logError(`[log tail] child process exit - ${this.cid}`, code)
            this.restart()
        })
        this.child.stdout.on('data', data => this.handler({
            log: data.toString(),
            stream: 'docker',
            time: (new Date()).toISOString()
        }))
    }

    restart () {
        if (!this.isActive) {
            return
        }

        this.restartsCount += 1
        const delay = this.restartsCount * this.restartDelay

        logVerbose(`[log-tail] restart in ${delay}`)

        this.restartTimer = setTimeout(() => {
            try {
                this.tailFile()
            } catch (err) {
                this.tailLogs()
            }
        }, delay)
    }

    start () {
        this.isActive = true
        this.restart()
    }

    stop () {
        this.isActive = false
        clearTimeout(this.restartTimer)

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
