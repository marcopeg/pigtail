
export class Daemon {
    constructor (settings) {
        this.isRunning = null
        this.timer = null

        this.name = settings.name
        this.interval = settings.interval
        this.handler = settings.handler

        this.start()
    }

    async loop () {
        const start = new Date()
        console.log('DAEMON LOOP')
        const interval = (await this.handler()) || this.interval
        
        // calculate next execution timeout based on execution time
        const lapsed = new Date() - start
        const schedule = interval > lapsed
            ? interval - lapsed
            : 0

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

}
