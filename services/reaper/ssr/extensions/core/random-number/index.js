exports.name = 'Random Number'
exports.register = ({ registerAction }) =>
    registerAction({
        hook: `▶ ApiSend::DockerMetrics`,
        name: 'random-number--extension',
        handler: ({ push }) => push('random-number', Math.random()),
    })
