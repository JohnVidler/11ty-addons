module.exports = function(eleventyConfig) {

    eleventyConfig.addNunjucksFilter( 'is_array', function( ref ) {
        return Array.isArray( ref );
    });
  };