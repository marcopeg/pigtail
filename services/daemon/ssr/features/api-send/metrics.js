import si from 'systeminformation'

export const snap = async () => {
    const ctime = new Date()
    const infos = await si.dockerContainers()
    const stats = await Promise.all(infos.map(container => si.dockerContainerStats(container.id)))
    const data = infos.map((container, idx) => ({
        id: container.id,
        name: container.name,
        cpu_usage: stats[idx].cpu_stats.cpu_usage.total_usage,
        cpu_percent: stats[idx].cpu_percent,
        mem_usage: stats[idx].mem_usage,
        mem_percent: stats[idx].mem_percent,
    }))

    return [{
        ctime,
        metric: 'mem_tot',
        value: data.reduce((acc, curr) => acc + curr.mem_usage, 0),
    }, {
        ctime,
        metric: 'cpu_tot',
        value: data.reduce((acc, curr) => acc + curr.cpu_usage, 0),
    }, {
        ctime,
        metric: 'cpu_percent_tot',
        value: data.reduce((acc, curr) => acc + curr.cpu_percent, 0),
    }]
}
