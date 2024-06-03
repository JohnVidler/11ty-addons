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

const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function (eleventyConfig, pluginOptions) {
    const markdownLib = pluginOptions.markdownLib;
    
    const linkCollection = [];
    const linkValidator = markdownLib.validateLink;

    markdownLib.validateLink = async function( url ) {
        if( url.startsWith("/") )
        return linkValidator( url );
        
        if( !url.startsWith( "http" ) )
        return linkValidator( url );
        
        if( linkCollection.find( v => v.url === url ) )
        return linkValidator( url );
        
        let checkedStatus = "unknown";
        let lastChecked = "never";
        try {
            lastChecked = new Date().toDateString();
            await EleventyFetch(url, { duration: "7d", removeUrlQueryParams: true });
            checkedStatus = "up";
        } catch ( err ) {
            checkedStatus = "down";
        }
        
        linkCollection.push({
            "url": url,
            "lastChecked": lastChecked,
            "status": checkedStatus
        });
        
        if( url.toLowerCase().startsWith("http:") ) {
            console.warn( `[11ty] Non-HTTPS link: ${url}` );
            return linkValidator( url );
        }
        return linkValidator( url );
    }
    
    eleventyConfig.addCollection('links', () => linkCollection);
}