const fs = require( 'fs' );
const path = require( 'path' );

module.exports = (eleventyConfig) => {
    // Simple Library Import Ops //
    eleventyConfig.addShortcode("require", function(pkg) {
        const infoPath = path.join('node_modules', pkg, 'package.json')
        if( !fs.existsSync( infoPath ) ) {
            console.warn( `[11ty] Unable to find requested package '${pkg}' - maybe try $> npm install -D ${pkg}` );
            return "";
        }
        console.info( `[11ty] Importing '${pkg}' as a library...` );
        const info = JSON.parse( fs.readFileSync(infoPath, { encoding: 'utf-8' }) );
        
        let fragment = [];

        for( file of info.files ) {
            const src = path.join( 'node_modules', pkg, file );
            const lib = path.join( eleventyConfig.dir.output, 'lib', pkg );
            const dst = path.join( eleventyConfig.dir.output, 'lib', pkg, file );
            const web = path.join( 'lib', pkg, file );
            
            fs.mkdirSync( lib, { recursive: true } );
            fs.copyFileSync( src, dst );

            if( file.endsWith(".js") )
                fragment.push( `<script type="text/javascript" src="/${web}"></script>` );
            else if( file.endsWith(".css") )
                fragment.push( `<link rel="stylesheet" href="/${web}">` );
        }

        return fragment.join('\n');
    });
};