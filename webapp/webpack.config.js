var path = require('path');

module.exports = {
    entry: [
        './src/index.js',
    ],
    resolve: {
        modules: [
            'src',
            'node_modules',
            '../../mattermost-webapp/',
        ],
        extensions: ['*', '.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        sourceMaps: true,
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    chrome: 66,
                                    firefox: 60,
                                    edge: 42,
                                    ie: 11,
                                    safari: 12,
                                },
                                modules: false,
                                debug: false,
                                useBuiltIns: 'usage',
                                shippedProposals: true,
                            }],
                            ['@babel/preset-react', {
                                useBuiltIns: true,
                            }],
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-syntax-dynamic-import',
                            'babel-plugin-react-css-modules',
                        ],
                    },
                },
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: true,
                            localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
                        },
                    },
                ],
            },
        ],
    },
    externals: {
        react: 'React',
        redux: 'Redux',
        'react-redux': 'ReactRedux',
    },
    output: {
        path: path.join(__dirname, '/dist'),
        publicPath: '/',
        filename: 'main.js',
    },
};
