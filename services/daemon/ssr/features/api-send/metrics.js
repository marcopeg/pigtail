import si from 'systeminformation'

export const snap = async () => {
    const ctime = new Date()

    // get a list of active containers
    const infos = await si.dockerContainers()

    // get detailed info for each container
    const stats = await Promise.all(infos.map(container => si.dockerContainerStats(container.id)))
    const statsMap = stats.reduce((acc, curr) => {
        acc[curr.id] = curr
        return acc
    }, {})

    const containers = infos.map(container => ({
        ...container,
        ...(statsMap[container.id] || {}),
    }))

    return [
        ...containers.map(container => ({
            ctime,
            metric: `container_${container.id}`,
            value: container,
        })),
        ...[{
            ctime,
            metric: 'cpu_percent_tot',
            value: containers.reduce((acc, curr) => acc + curr.cpu_percent, 0),
        },{
            ctime,
            metric: 'cpu_tot',
            value: containers.reduce((acc, curr) => acc + curr.cpu_stats.cpu_usage.total_usage, 0),
        }]
    ]
}
