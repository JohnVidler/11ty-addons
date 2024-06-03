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