exports.register = ({ registerAction }) =>
    registerAction({
        hook: `◇ finish`,
        name: 'community-foo--extension',
        handler: () => console.log(`# community-foo >> ${Math.random()}`),
    })
