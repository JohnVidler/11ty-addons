const { createHash } = require('crypto');

function getHash( email ) {
    return createHash('sha256').update(email.trim()).digest('hex');
}

function getAvatarURL( email, size=200 ) {
    return `https://gravatar.com/avatar/${getHash(email)}?s=${size}`;
}

function htmlShortcode( email ) {
    return `<div class="avatar"><div class="w-24 mask mask-hexagon-2"><img style="margin:auto;" src="${getAvatarURL(email)}" /></div></div>`;
}

function imgShortcode( email, _class="" ) {
    if( _class != "" )
        return `<img style="margin:auto;" class="${_class}" src="${getAvatarURL(email)}" />`;
    return `<img style="margin:auto;" src="${getAvatarURL(email)}" />`;
}

module.exports = (eleventyConfig) => {
    // Embed Gravatar Avatars //
    eleventyConfig.addShortcode( "gravatar", htmlShortcode );
    eleventyConfig.addShortcode( "gravatar_img", imgShortcode );
}