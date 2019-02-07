import { exec } from 'child_process'

const parseLine = (line) => {
    const tokens = line.split(' ').filter(i => i.length > 0)
    return {
        fs: tokens[0],
        total: tokens[1],
        used: tokens[2],
        free: tokens[3],
        usage: tokens[4], 
        mount: tokens[5],
    }
}

export const df = () => new Promise((resolve, reject) => {
    exec('df -Pk', {}, (err, stdout, stderr) => {
        if (err) {
            reject(new Error(err))
            return
        }
        resolve(stdout.toString())
    })
})

export const parsedDf = async () => {
    const str = await df()
    return str
        .replace(/^\s*\n|\s+$/g, '')
        .split('\n')
        .slice(1)
        .map(parseLine)
}
