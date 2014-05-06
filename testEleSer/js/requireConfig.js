/*globals require*/
console.log('configuring require');
require.config({
    shim: {

    },
    paths: {
        requirejs: 'requirejs/require'
    }
});
require(['main']);
