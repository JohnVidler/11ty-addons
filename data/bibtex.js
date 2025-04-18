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

            return {
                list: records,
                byYear: records.sort( (a,b) => a.Fields.year - b.Fields.year )
            };
        } catch ( err ) {
            console.warn( `Unable to parse ${filepath}` );
            console.warn( err );
        }
        return [];
    } );
};