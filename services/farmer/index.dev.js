require('@babel/polyfill')
require('@babel/register')

require('./src/boot').default().catch((err) => {
    console.log('*** BOOT: Fatal Error')
    console.log(err)
})
