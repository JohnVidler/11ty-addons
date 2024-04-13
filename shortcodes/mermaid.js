const pluginMermaid = require( "@kevingimbel/eleventy-plugin-mermaid" );

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin( pluginMermaid, {
    // load mermaid from local assets directory
    html_tag: 'div',
    extra_classes: 'graph',
    mermaid_config: {
      'startOnLoad': true
    }
  } );
};