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

const sharp = require( 'sharp' );
const path = require( 'node:path' );
const fs = require( 'node:fs' );
const crypto = require('crypto');

module.exports = async function (eleventyConfig, pluginOptions) {

    const config = {
        cache: ".cache/",
        noCache: false,
        maxWidth: 900,
        quality: 50,
        nearLossless: true,
        ...pluginOptions
    }

    async function imageCompiler( inputContent, inputPath ) {
        return async () => {
            const nameHash = crypto.createHash( 'sha1' ).update( path.basename(inputPath) ).digest( 'hex' );
            const dataHash = crypto.createHash( 'sha1' ).update( inputContent ).digest( 'hex' );

            const cachePath = path.join( config.cache, `webify-image-${nameHash}` );

            // Check the cache
            if( !config.noCache && fs.existsSync( cachePath ) ) {
                try {
                    const cacheData = JSON.parse( fs.readFileSync( cachePath, 'utf8' ) );

                    if( cacheData.hash == dataHash )
                        return Buffer.from( cacheData["file"], 'base64');

                    console.warn( `[11ty::webify-image] ${inputPath} - Cache miss, last build: ${cacheData.date} Rebuilding...` );
                } catch( err ) {
                    console.warn( `Unable to read cache file ${cachePath} (bad cache file format?), forcing us to process ${inputPath} again...` );
                }
            }

            const image = sharp( inputPath )
            const meta = await image.metadata();

            if( meta.width > config.maxWidth ) {
                console.warn( `[11ty::webify-image] ${inputPath} - Oversize width: ${meta.width}, clamping to ${config.maxWidth}` );
                image.resize( config.maxWidth );
            }

            if( meta.exif ) {
                console.warn( `[11ty::webify-image] ${inputPath} - Has EXIF, removing...` );
                image.withExif( {} );
            }

            switch( meta.format ) {
                case "jpg":
                case "jpeg":
                    image.jpeg( {
                        quality: config.quality,
                        nearLossless: config.nearLossless
                    } );
                    break;
                
                case "png":
                    image.png( {
                        quality: config.quality,
                        lossless: !config.nearLossless
                    } );
                    break;
                
                case "webp":
                    image.webp( {
                        quality: config.quality,
                        lossless: !config.nearLossless
                    } );
                    break;
                
                default:
                    console.log( `[11ty::webify-image] ${inputPath} - Unknown format: ${meta.format}, passing through without re-encoding` );
            }
            
            // At this point update the cache too!

            const outputBuffer = await image.toBuffer();
            const updatedCacheData = {
                "file": outputBuffer.toString("base64"),
                "hash": dataHash,
                "path": inputPath,
                "date": new Date().toLocaleString()
            }
            if( !config.noCache )
                fs.writeFileSync( cachePath, JSON.stringify(updatedCacheData), 'utf8' );

            return outputBuffer;
        }
    }

    [ "png", "jpg", "jpeg", "webp" ].forEach( fmt => {
        eleventyConfig.addTemplateFormats( fmt );
        eleventyConfig.addExtension( fmt, { compile: imageCompiler, outputFileExtension: fmt } );
    } )
    
    return [];
}