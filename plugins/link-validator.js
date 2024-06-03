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