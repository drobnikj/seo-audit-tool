async function $basicSEO(userParams = {}) {

    const DEFAULT_SEO_PARAMS = {
        maxTitleLength: 70,
        minTitleLength: 10,
        maxMetaDescriptionLength: 140,
        maxLinksCount: 3000,
        maxWordsCount: 350,
    };

    const params = Object.assign(DEFAULT_SEO_PARAMS, userParams);
    const basicSEO = {};

    // Check flash content
    if ($('script:contains(embedSWF)').length) basicSEO.isUsingFlash = true;
    // -- Google Analytics
    // Check for GA Object (e.g crawler can not find function(i,s,o,g,r,a,m) in meteor page like Apifier)
    basicSEO.isGoogleAnalyticsObject = (typeof ga !== 'undefined');
    // Check for GA function (function(i,s,o,g,r,a,m)) exists in page
    basicSEO.isGoogleAnalyticsFunc = !!($(`script:contains(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject'])`).length);
    // -- Meta charset
    basicSEO.isCharacterEncode = !!($('meta[charset]'));
    // -- Meta description
    basicSEO.isMetaDescription = !!($('meta[name=description]').length);
    if (basicSEO.isMetaDescription) {
        basicSEO.metaDescription = $('meta[name=description]').attr('content');
        basicSEO.isMetaDescriptionLong = (basicSEO.metaDescription.length > params.maxMetaDescriptionLength);
    }
    // --  Doctype
    basicSEO.isDoctype = !!(document.doctype);
    // -- Title
    if ($('title').length) {
        basicSEO.isTitle = true;
        basicSEO.title = $('title').text();
        const titleLength = basicSEO.title.length;
        basicSEO.isTitleLong = (titleLength > params.maxTitleLength);
        basicSEO.isTitleShort = (titleLength < params.minTitleLength);
    } else basicSEO.isTitle = false;
    // -- h1
    const h1Count = $('h1').length;
    basicSEO.isH1 = (h1Count > 0);
    if (basicSEO.isH1) basicSEO.h1 = $('h1').text();
    basicSEO.isH1Multiple = (h1Count > 1);
    // -- h2
    basicSEO.isH2 = !!($('h2').length);
    // -- Links
    const $allLinks = $('a');
    basicSEO.linksCount = $allLinks.length;
    basicSEO.isTooMuchlinks = (basicSEO.linksCount > params.maxLinksCount);
    basicSEO.internalNoFollowLinks = [];
    $allLinks.each(function() {
        if ($(this).attr('rel') === 'nofollow'
            && this.href.indexOf(window.location.hostname) > -1) {
            basicSEO.internalNoFollowLinks.push(this.href);
        }
    });
    basicSEO.internalNoFollowLinksCount = basicSEO.internalNoFollowLinks.length;
    //Check broken links
    basicSEO.brokenLinks = [];
    const linksToFetchPromises = $allLinks
        .filter(function() {
            const href = $(this).attr('href');
            return href
                && !href.includes('javascript:')
                && !href.includes('mailto:');
        }).map(function() {
            const href = $(this).attr('href');
            return href;
            return fetch(href).then((response) => {
                console.log(href, response.status)
                if (response.status !== 200) {
                    basicSEO.brokenLinks.push(href);
                }
            }).catch(() =>  basicSEO.brokenLinks.push(href))
    });
    await Promise.all(linksToFetchPromises);
    // -- images
    basicSEO.notOptimizedImgs = [];
    $('img:not([alt])').each(function() {
        basicSEO.notOptimizedImgs.push($(this).attr('src'));
    });
    basicSEO.notOptimizedImgsCount = basicSEO.notOptimizedImgs.length;
    // -- words count
    basicSEO.wordsCount = $('body').text().match(/\S+/g).length;
    basicSEO.isContentTooLong = (basicSEO.wordsCount > params.maxWordsCount);
    // -- viewport
    basicSEO.isViewport = !!($('meta[name=viewport]'));
    // -- amp version if page
    basicSEO.isAmp = !!($('html[⚡]') || $('html[amp]'));
    // -- iframe check
    basicSEO.isIframe = !!($('iframe').length);

    // TODO: Check broken links and images
    /*
    // -- check broken links
context.willFinishLater();
var promises = [];
result.brokenLinks = {
internal: [],
external: []
};
$('a').each(function() {
var self = this;
// skips mailto and JS href
if (self.href.indexOf('javascript:') === -1 && self.href.indexOf('mailto:') === -1) {
    var p = $.get(self.href)
    .done(function(data) {
        // good link
    })
    .fail(function( jqXHR, textStatus, errorThrown ){
        if (errorThrown.name === 'SecurityError') {
            // need to fix this error, page blocked jquery requests
            // FIX: We can do requests from other page
        }
        // broken link
        if (window.location.hostname == self.hostname) result.brokenLinks.internal.push(self.href);
        else result.brokenLinks.external.push(self.href);
    });
    promises.push(p);
}
});
// -- check broken images
result.brokenImgs = {
internal: [],
external: []
};
$('a').each(function() {
var self = this;
var p = $.get(self.src, function() {
    // good image
})
.fail(function() {
    // broken image
    if (self.src.split('?')[0].indexOf(window.location.hostname) > -1)
        result.brokenImgs.internal.push(self.href);
    else
        result.brokenImgs.external.push(self.href);
});
promises.push(p);
});
     */

    return basicSEO;
}

module.exports = {
    $basicSEO,
};
