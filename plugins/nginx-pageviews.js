const fs = require( "fs" )

const NGINX_LOG_REGEX = /(?<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) (?<domain>[^ ]+) \- \[(?<datetime>\d{2}\/[a-zA-Z]{3}\/\d{4}:\d{2}:\d{2}:\d{2} (?:\+|\-)\d{4})\] "(?<method>\w+) (?<url>[^ ]+) (?<proto>[^ ]+)" (?<status>\d+) (?<bytes>\d+) "[^"]+" "(?<agent>[^"]+)"/;
const UAGENT_REGEX = /(\w+bot|spider|mapping|inspect|curl|python|zgrab|l9|wget|http[-]?client)/i;

module.exports = function (eleventyConfig, pluginOptions) {
    const CONFIG = {
        log: undefined,
        ...pluginOptions
    }

    // Load in the logs...
    const stats = {};

    if( fs.existsSync( CONFIG.log ) ) {
        console.log( `[11ty] Reading NGinx logs...` );
        let rows = 0;
        const logFile = fs.readFileSync( CONFIG.log, "utf8" );
        for( const line of logFile.split("\n") ){
            rows++;
            const results = NGINX_LOG_REGEX.exec( line );
            if( results ) {
                let { method, url, agent } = results.groups;

                let record = stats[url] || {};
                record.views = record.views + 1 || 1;

                record.methods = record.methods || {};
                record.methods[method] = record.methods[method] + 1 || 1;
                
                agent = UAGENT_REGEX.exec(agent);
                if( agent ) {
                    record.automata = record.automata || [];
                    if( ! record.automata.includes( agent[0] ) )
                        record.automata.push( agent[0] );
                }

                console.log( `\t${url} -> ${record.views}` );

                stats[url] = record;
            }
        }
        console.log( `[11ty] Read ${rows} log lines...` );
    }

    function getUrlPath( url ) {
        let path = url.replace(/index\..+$/, "");

        if( path.endsWith("/") )
            return path.slice(0, -1);
        return path;
    }

    eleventyConfig.addShortcode( "pageViews", function ( page ) {
        const path = getUrlPath( page.url );

        if( stats[ path ] )
            return stats[ path ].views || 0;
        return 0;
    } );

    eleventyConfig.addShortcode( "pageMethods", function ( page ) {
        const path = getUrlPath( page.url );

        if( stats[ path ] )
            return stats[ path ].methds || [];
        return [];
    } );

    eleventyConfig.addShortcode( "pageBots", function ( page ) {
        const path = getUrlPath( page.url );

        if( stats[ path ] )
            return stats[ path ].automata || [];
        return [];
    } );
}