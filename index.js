const dockerstats = require('dockerstats');
const si = require('systeminformation');

// full async / await example (node >= 7.6)
async function dockerContainers() {
    try {
        const data = await dockerstats.dockerContainers();
        console.log(data)
    } catch (e) {
        console.log(e)
    }
}

// full async / await example (node >= 7.6)
async function cpu() {
    try {
        const data = await si.cpu();
        console.log(data)
    } catch (e) {
        console.log(e)
    }
}

async function dockerStats () {

    const infos = await si.dockerContainers()
    const stats = await Promise.all(infos.map(container => si.dockerContainerStats(container.id)))

    const data = infos.map((container, idx) => ({
        id: container.id,
        name: container.name,
        cpu_percent: stats[idx].cpu_percent,
        mem_percent: stats[idx].mem_percent,
    }))

    // console.log(data)

    // console.log(infos)
    console.log(stats)

    // const containers = []
    // for (const container of await si.dockerContainers()) {
    //     const stats = await si.dockerContainerStats(container.id)
    //     console.log(container.id)
    //     console.log(stats)
    //     containers.push({
    //         id: container.id,
    //         cpu_percent: stats.cpu_percent,
    //         mem_percent: stats.mem_percent,
    //     })
    // }

    // console.log('====')
    // console.log(containers)
}

// dockerContainers()
dockerStats()
