var path = require('path')
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },

    devtool: 'source-map',

    module: {

        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react', 'stage-0']
                    }
                }
            }
        ]
    },
    externals: {
        'react': 'commonjs react'
    }
}
