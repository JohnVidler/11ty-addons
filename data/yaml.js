const yaml = require("js-yaml");

module.exports = (eleventyConfig) => {
    eleventyConfig.addDataExtension("yml, yaml", (contents, filePath) => {
        return yaml.load( contents );
    });
}