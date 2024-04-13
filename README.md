# 11ty-addons
My own addons for my 11ty-based sites. YMMV

To include this in your 11ty project, enable git submodules with `git submodule init` then clone this repository into the `src/_11ty/` path with `git submodule add https://github.com/JohnVidler/11ty-addons.git src/_11ty`

Most functions can be included directly into your `.eleventy.config.js` by handing the `eleventyConfig` object into their exported functions:

```
...
module.exports = function(eleventyConfig) {
  ...
  require( './src/_11ty/shortcodes/gravatar.js' )( eleventyConfig );
  require( './src/_11ty/shortcodes/require.js' )( eleventyConfig );
  require( './src/_11ty/shortcodes/mermaid.js' )( eleventyConfig );
  ...
};
```
