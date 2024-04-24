function htmlFigure( image, caption ) {
    return `<figure>
        <img class="ml-auto mr-auto rounded-lg" src="${image}" alt="${caption}" />
        <div class="ml-auto mr-auto flow-root max-w-lg text-center text-sm">${caption}</div>
    </figure>`;
    return `<img src="${image}" alt="${caption}" />`
}

module.exports = (eleventyConfig) => {
    // Embed Gravatar Avatars //
    eleventyConfig.addShortcode( "imgFigure", htmlFigure );
}