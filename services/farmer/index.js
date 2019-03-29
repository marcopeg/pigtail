/* eslint-disable */
'use strict';

require('@babel/polyfill');

require('./build/boot').default().catch(function (err) {
    console.log('*** BOOT: Fatal Error');
    console.log(err);
});
