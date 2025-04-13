/* MIT License

Copyright (c) 2024 Dr John Vidler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

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
    /*list.push( ...await scholarly.user( pluginOptions.user ) );
    list = list.map( (v) => {
        if( isNaN(v.year) )
            v.year = null;
        
        if( v.url == '' )
            v.url = `https://scholar.google.com/scholar?q=${encodeURIComponent(v.title+": "+v.authors.join(","))}`;

        return v;
    } );*/
    return list.sort( (a,b) => b.year - a.year );
};