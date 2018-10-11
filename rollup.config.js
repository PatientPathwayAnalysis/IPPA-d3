const definition = require("./package.json");
const dependencies = Object.keys(definition.dependencies || {});

export default {
    input: 'index.js',
    external: dependencies,
    output: {
        name: 'vis',
        file: 'build/ippa-vis.js',
        format: 'iife'
    },
    plugins: [ ]
}
