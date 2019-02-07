import { exec } from 'child_process'

export const du = (target) => new Promise((resolve, reject) => {
    const cmd = `du -sk ${target}`
    exec(cmd, {}, (err, stdout, stderr) => {
        if (err) {
            reject(new Error(err))
            return
        }
        resolve(stdout.toString())
    })
})

export const parsedDu = async (target) => {
    const str = (await du(target))
        .trim()
        .split('\t')
        .shift()
        
    return Number(str)
}
