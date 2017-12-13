var Encore = require('@symfony/webpack-encore');
var CopyWebpackPlugin = require('copy-webpack-plugin');

Encore
    // the project directory where all compiled assets will be stored
    .setOutputPath('dist/')

    // the public path used by the web server to access the previous directory
    .setPublicPath('/')

    // Source files.
    .addEntry('exceptionlist/plugin', './src/exceptionlist/plugin.js')
    .addEntry('runin/plugin', './src/runin/plugin.js')
    .addEntry('standardexception/plugin', './src/standardexception/plugin.js')

    // Enable SASS.
    .enableSassLoader()
    .enableSourceMaps(!Encore.isProduction())
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()

    .addPlugin(new CopyWebpackPlugin([
        {
            from: './src/exceptionlist',
            to:   'exceptionlist',
            ignore: ['*.js']
        },
        {
            from: './src/runin',
            to:   'runin',
            ignore: ['*.js']
        },
        {
            from: './src/standardexception',
            to:   'standardexception',
            ignore: ['*.js']
        }
    ]))
;

module.exports = Encore.getWebpackConfig();