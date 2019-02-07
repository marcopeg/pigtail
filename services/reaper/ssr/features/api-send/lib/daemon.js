import { logError, logDebug } from 'ssr/services/logger'

export class Daemon {
    constructor (settings) {
        this.isRunning = null
        this.timer = null
        this.ctx = settings.context || {}

        this.loops = 0
        this.errors = 0
        this.lapsed = 0

        this.name = settings.name
        this.interval = settings.interval
        this.intervalOnError = settings.intervalOnError
        this.handler = settings.handler

        this.start()
    }

    async loop () {
        const start = new Date()

        // run the logic and gather metrics
        let interval
        try {
            interval = (await this.handler(this.ctx)) || this.interval
            this.loops += 1
        } catch (err) {
            interval = this.intervalOnError || this.interval
            this.errors += 1
            logError(`[${this.name}] ${err.message}`)
            logDebug(err)
        }
        
        // calculate next execution timeout based on execution time
        const lapsed = new Date() - start
        const schedule = interval > lapsed
            ? interval - lapsed
            : 0

        this.lapsed += lapsed
        this.timer = setTimeout(() => this.loop(), schedule)
    }

    start () {
        this.isRunning = true
        this.loop()
    }

    stop () {
        clearTimeout(this.timer)
        this.isRunning = false
    }

    getStats () {
        return {
            loops: this.loops,
            lapsed: this.lapsed,
            errors: this.errors,
        }
    }
}
