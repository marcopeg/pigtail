#!/usr/bin/env node

const path = require('path')
const exec = require('child_process').exec
const clipboardy = require('clipboardy')
const env = require('node-env-file')

// load ".rapharc"
try {
    env(path.resolve(process.cwd(), '.rapharc'))
} catch (err) {
    console.log('')
    console.log('--- Rapha Reaper ---')
    console.log('WARNING: no config file was found (.rapharc)')
    console.log('generic environment variables will be used to setup the reaper.')
    console.log('')
    console.log('')
}

const pm2 = path.resolve(__dirname, '..', 'node_modules', '.bin', 'pm2')
const app = path.resolve(__dirname, '..', 'rapha-reaper.js')

const args = process.argv.splice(process.execArgv.length + 2)
const mainCmd = args.splice(0, 1).shift() || 'help'

const execp = cmd => new Promise((resolve, reject) =>
    exec(cmd, {}, (err, stdout) =>
        err ? reject(err) : resolve(stdout.toString())
    )
)

const onError = err => console.log(err.message)
const onSuccess = res => console.log(res)

const start = () => {
    const errors = []
    const requiredEnvVars = [ 'HOST_NAME', 'API_ENDPOINT', 'API_TOKEN' ]
    requiredEnvVars.forEach(key => {
        if (!process.env[key]) {
            errors.push(`env ${key} is required`)
        }
    })

    if (errors.length) {
        errors.forEach(msg => console.log(msg))
        process.exit(1)
    }

    execp(`${pm2} start ${app} ${args.join(' ')}`)
        .then(onSuccess)
        .catch(onError)
    }

const monit = () => {
    console.log('** TEMPORARY IMPLEMENTATION **')
    console.log(`Ctrl+v or copy/paste:\t${pm2} monit ${app} ${args.join(' ')}`)
    clipboardy.writeSync(`${pm2} monit ${app} ${args.join(' ')}`)
}

const stop = () =>
    execp(`${pm2} stop ${app} ${args.join(' ')}`)
        .then(onSuccess)
        .catch(onError)

const down = () => {
    stop()
        .then(() =>
            execp(`${pm2} delete ${app} ${args.join(' ')}`)
                .then(onSuccess)
                .catch(err => console.log(err.message))
        )
        .catch(onError)
}

const help = () => {
    console.log('help')
}

const commandsMap = {
    start,
    stop,
    down,
    monit,
    help,
}

if (Object.keys(commandsMap).includes(mainCmd)) {
    commandsMap[mainCmd]()
}
