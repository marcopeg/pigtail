exports.register = ({ registerAction }) =>
    registerAction({
        hook: `▶ ApiSend::DockerMetrics`,
        name: 'foo',
        handler: ({ push }) => push('foo-dev-extension', Math.random()),
    })
