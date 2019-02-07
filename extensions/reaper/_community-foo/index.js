exports.register = ({ registerAction }) =>
    registerAction({
        hook: `▶ ApiSend::DockerMetrics`,
        name: 'community-foo-extension',
        handler: ({ push }) => push('community-foo', Math.random()),
    })
