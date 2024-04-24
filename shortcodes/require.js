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