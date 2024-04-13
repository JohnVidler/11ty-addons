const BibtexParser = require( "bib2json" );

module.exports = (eleventyConfig) => {
    eleventyConfig.addDataExtension( "bib", (contents, filepath) => {
        try {
            let records = BibtexParser(contents).entries;

            records.forEach(record => {
                if( record.Fields.howpublished && record.Fields.howpublished.startsWith( 'url' ) )
                    record.Fields.howpublished = `<a href='${record.Fields.howpublished.substr( 3 )}' target='_blank'>${record.Fields.howpublished.substr( 3 )}</a>`;

                if( record.Fields.author )
                    record.Fields.author = record.Fields.author.replace( ' AND ', '; ' );
            });

            return records;
        } catch ( err ) {
            console.warn( `Unable to parse ${filepath}` );
            console.warn( err );
        }
        return [];
    } );
};