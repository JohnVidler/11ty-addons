const scholarly = require('scholarly');

/**
 * Requires a `user` option with a google scholar user ID string.
 * 
 * ```
 * { 'user': 'UserIdStringHere' }
 * ```
 */
module.exports = function (eleventyConfig, pluginOptions) {
    if( !pluginOptions || !pluginOptions.user ) {
        console.warn( "Publications: Missing or invalid user ID string in plugin options. Skipped." )
        return [];
    }

	let list = [];
    list.push( ...await scholarly.user( pluginOptions.user ) );
    list = list.map( (v) => {
        if( isNaN(v.year) )
            v.year = null;
        
        if( v.url == '' )
            v.url = `https://scholar.google.com/scholar?q=${encodeURIComponent(v.title+": "+v.authors.join(","))}`;

        return v;
    } );
    return list.sort( (a,b) => b.year - a.year );
};